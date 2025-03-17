package com.fptgang.backend.service.impl;

import com.fptgang.backend.model.Milestone;
import com.fptgang.backend.model.Transaction;
import com.fptgang.backend.repository.MilestoneRepos;
import com.fptgang.backend.service.MilestoneService;
import com.fptgang.backend.service.TransactionService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.EntityUtil;
import com.fptgang.backend.util.OpenApiHelper;
import com.google.common.base.Preconditions;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Map;
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
    private final TransactionService transactionService;

    public MilestoneServiceImpl(MilestoneRepos milestoneRepos, TransactionService transactionService) {
        this.milestoneRepos = milestoneRepos;
        this.transactionService = transactionService;
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
        return milestoneRepos.save(existing);
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
        var spec = OpenApiHelper.groupBy( params.<Milestone>toSpec(), "milestoneId");
        return milestoneRepos.findAll(spec, params.getPageable());
    }
}
