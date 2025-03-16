package com.fptgang.backend.service.impl;

import com.fptgang.backend.model.File;
import com.fptgang.backend.model.Milestone;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.repository.MilestoneRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.security.AuthContext;
import com.fptgang.backend.service.FileService;
import com.fptgang.backend.service.MilestoneService;
import com.fptgang.backend.service.TransactionService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.EntityUtil;
import com.fptgang.backend.util.OpenApiHelper;
import com.google.common.base.Preconditions;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
@Slf4j
public class MilestoneServiceImpl implements MilestoneService {
    private static final Map<Milestone.MilestoneStatus, Set<Milestone.MilestoneStatus>> MILESTONE_TRANSITIONS = Map.of(
            Milestone.MilestoneStatus.PENDING, Set.of(Milestone.MilestoneStatus.IN_PROGRESS, Milestone.MilestoneStatus.TERMINATED),
            Milestone.MilestoneStatus.IN_PROGRESS, Set.of(Milestone.MilestoneStatus.REVIEWING, Milestone.MilestoneStatus.TERMINATED),
            Milestone.MilestoneStatus.REVIEWING, Set.of(Milestone.MilestoneStatus.FINISHED, Milestone.MilestoneStatus.TERMINATED),
            Milestone.MilestoneStatus.FINISHED, Set.of(),
            Milestone.MilestoneStatus.TERMINATED, Set.of()
    );
    private static final Map<Milestone.FundStatus, Set<Milestone.FundStatus>> FUND_TRANSITIONS = Map.of(
            Milestone.FundStatus.NONE, Set.of(Milestone.FundStatus.DEPOSITED),
            Milestone.FundStatus.DEPOSITED, Set.of(Milestone.FundStatus.RELEASED, Milestone.FundStatus.REFUNDED),
            Milestone.FundStatus.RELEASED, Set.of(),
            Milestone.FundStatus.REFUNDED, Set.of()
    );
    private final MilestoneRepos milestoneRepos;
    private final ProjectRepos projectRepos;
    private final TransactionService transactionService;
    private final AuthContext authContext;
    private final FileService fileService;

    public MilestoneServiceImpl(MilestoneRepos milestoneRepos,
                                ProjectRepos projectRepos,
                                TransactionService transactionService,
                                AuthContext authContext,
                                FileService fileService) {
        this.milestoneRepos = milestoneRepos;
        this.projectRepos = projectRepos;
        this.transactionService = transactionService;
        this.authContext = authContext;
        this.fileService = fileService;
    }

    @Override
    public Milestone create(Milestone milestone) {
        milestone.setMilestoneId(null);
        return milestoneRepos.save(milestone);
    }

    @Override
    public Milestone update(Milestone milestone) {
        var existing = milestoneRepos.findById(milestone.getMilestoneId())
                .orElseThrow(() -> new IllegalArgumentException("Milestone does not exist"));

        if (milestone.getFundStatus() != null && existing.getFundStatus() != milestone.getFundStatus())
            Preconditions.checkArgument(
                    FUND_TRANSITIONS.get(existing.getFundStatus()).contains(milestone.getFundStatus()),
                    "Invalid fund status transition");

        if (milestone.getStatus() != null && existing.getStatus() != milestone.getStatus())
            Preconditions.checkArgument(
                    MILESTONE_TRANSITIONS.get(existing.getStatus()).contains(milestone.getStatus()),
                    "Invalid milestone status transition");

        EntityUtil.merge(existing, milestone);
        return milestoneRepos.save(milestone);
    }

    @Override
    public Milestone findById(long id) {
        return milestoneRepos.findById(id).orElse(null);
    }

    @Override
    public Milestone deleteById(long id) {
        var milestone = milestoneRepos.findById(id).orElseThrow(() -> new IllegalArgumentException("Milestone does not exist"));
        milestone.setIsVisible(false);
        return milestoneRepos.save(milestone);
    }

    @Override
    @Transactional
    public Milestone depositFund(Milestone milestone) {
        Preconditions.checkArgument(milestone.getIsVisible(), "Milestone is not visible");
        Preconditions.checkArgument(
                milestone.getStatus() == Milestone.MilestoneStatus.PENDING ||
                        milestone.getStatus() == Milestone.MilestoneStatus.IN_PROGRESS,
                "Milestone is not pending or in progress");
        Preconditions.checkArgument(milestone.getFundStatus() == Milestone.FundStatus.NONE,
                "Milestone is not in NONE fund status");
        authContext.requireAccountId(milestone.getProject().getClient().getAccountId());

        // There must be no visible, unfunded milestone before this one
        Milestone prevMilestone = milestone.getPrevVisibleMilestone();
        if (prevMilestone != null && prevMilestone.getFundStatus() == Milestone.FundStatus.NONE) {
            throw new IllegalStateException("Milestone " + prevMilestone.getMilestoneId() + " must be funded first");
        }

        if (transactionService.createEscrowDeposit(milestone) != null) {
            milestone.setFundStatus(Milestone.FundStatus.DEPOSITED);
            milestone = milestoneRepos.save(milestone);
            log.info("Fund deposited for milestone {}", milestone.getMilestoneId());
        }
        return milestone;
    }

    @Override
    @Transactional
    public Milestone releaseFund(Milestone milestone) {
        Preconditions.checkArgument(milestone.getIsVisible(), "Milestone is not visible");
        Preconditions.checkArgument(
                milestone.getStatus() != Milestone.MilestoneStatus.PENDING,
                "Milestone must not be pending");
        Preconditions.checkArgument(milestone.getFundStatus() == Milestone.FundStatus.DEPOSITED,
                "Milestone is not in DEPOSITED fund status");
        if (transactionService.createEscrowRelease(milestone) != null) {
            milestone.setFundStatus(Milestone.FundStatus.RELEASED);
            milestone = milestoneRepos.save(milestone);
            log.info("Fund released for milestone {}", milestone.getMilestoneId());
        }
        return milestone;
    }

    @Override
    @Transactional
    public Milestone returnFund(Milestone milestone) {
        Preconditions.checkArgument(milestone.getIsVisible(), "Milestone is not visible");
        Preconditions.checkArgument(milestone.getFundStatus() == Milestone.FundStatus.DEPOSITED,
                "Milestone is not in DEPOSITED fund status");
        if (transactionService.createEscrowRefund(milestone) != null) {
            milestone.setFundStatus(Milestone.FundStatus.REFUNDED);
            milestone = milestoneRepos.save(milestone);
            log.info("Fund returned for milestone {}", milestone.getMilestoneId());
        }
        return milestone;
    }

    @Override
    public Page<Milestone> getAll(ListParams params) {
        var spec = OpenApiHelper.groupBy(params.<Milestone>toSpec(), "milestoneId");
        return milestoneRepos.findAll(spec, params.getPageable());
    }

    @Override
    @Transactional
    public Milestone submitWork(Milestone milestone, List<MultipartFile> blobs) {
        Preconditions.checkArgument(!blobs.isEmpty(), "Files are empty");
        Preconditions.checkArgument(
                milestone.getStatus() == Milestone.MilestoneStatus.IN_PROGRESS ||
                        milestone.getStatus() == Milestone.MilestoneStatus.REVIEWING,
                "Milestone is not in progress or reviewing");
        Preconditions.checkNotNull(milestone.getProject().getActiveMilestone());
        Preconditions.checkArgument(
                Objects.equals(
                        milestone.getProject().getActiveMilestone().getMilestoneId(),
                        milestone.getMilestoneId()
                ), "Milestone is not active");
        Preconditions.checkNotNull(milestone.getProject().getContract());
        authContext.requireAccountId(milestone.requireFreelancer().getAccountId());

        // Change to reviewing if not yet
        if (milestone.getStatus() == Milestone.MilestoneStatus.IN_PROGRESS) {
            milestone.setStatus(Milestone.MilestoneStatus.REVIEWING);
            milestone = milestoneRepos.save(milestone);
        }

        for (MultipartFile blob : blobs) {
            milestone.getDeliverables().add(
                    fileService.create(
                            File.of(blob)
                                    .uploader(milestone.requireFreelancer())
                                    .milestone(milestone)
                                    .build(),
                            blob
                    )
            );
        }

        return milestone;
    }

    @Override
    @Transactional
    public Milestone confirmWork(Milestone milestone) {
        Preconditions.checkArgument(
                milestone.getStatus() == Milestone.MilestoneStatus.REVIEWING,
                "Milestone is not in reviewing");
        Preconditions.checkNotNull(milestone.getProject().getActiveMilestone());
        Preconditions.checkArgument(
                Objects.equals(
                        milestone.getProject().getActiveMilestone().getMilestoneId(),
                        milestone.getMilestoneId()
                ), "Milestone is not active");
        Preconditions.checkNotNull(milestone.getProject().getContract());
        authContext.requireAccountId(milestone.getProject().getClient().getAccountId());

        // Finish current milestone
        releaseFund(milestone);
        milestone.setStatus(Milestone.MilestoneStatus.FINISHED);
        milestone = milestoneRepos.save(milestone);
        log.info("Milestone {} finished", milestone.getMilestoneId());

        // *** If no more milestones, finish project
        Milestone nextMilestone = milestone.getNextVisibleMilestone();
        if (nextMilestone == null) {
            milestone.getProject().setStatus(Project.ProjectStatus.FINISHED);
            milestone.getProject().setActiveMilestone(null);
            milestone.setProject(projectRepos.save(milestone.getProject()));
            log.info("Project {} finished", milestone.getProject().getProjectId());
            return milestone;
        }

        // *** Otherwise, start next milestone
        if (nextMilestone.getFundStatus() == Milestone.FundStatus.NONE) {
            if (nextMilestone.getProject().getClient().getBalance().compareTo(nextMilestone.getContractualBudget()) < 0) {
                throw new IllegalStateException("Not enough balance to fund the next milestone");
            }
            nextMilestone = depositFund(nextMilestone);
        }

        nextMilestone.setStatus(Milestone.MilestoneStatus.IN_PROGRESS);
        nextMilestone = milestoneRepos.save(nextMilestone);

        nextMilestone.getProject().setActiveMilestone(nextMilestone);
        nextMilestone.setProject(projectRepos.save(nextMilestone.getProject()));

        log.info("Milestone {} started", nextMilestone.getMilestoneId());
        return nextMilestone;
    }
}
