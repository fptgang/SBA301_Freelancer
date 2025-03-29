package com.fptgang.backend.service.impl;

import com.fptgang.backend.config.HirableConfig;
import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.model.Proposal;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.repository.ProposalRepos;
import com.fptgang.backend.security.AuthContext;
import com.fptgang.backend.service.EmailService;
import com.fptgang.backend.service.ProposalService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.OpenApiHelper;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProposalServiceImpl implements ProposalService {

    private final ProposalRepos proposalRepos;
    private final ProjectRepos projectRepos;
    private final AccountRepos accountRepos;
    private final HirableConfig hirableConfig;
    private final AuthContext authContext;
    private final EmailService emailService;
    public ProposalServiceImpl(ProposalRepos proposalRepos,
                               ProjectRepos projectRepos,
                               AccountRepos accountRepos,
                               HirableConfig hirableConfig,
                               AuthContext authContext, EmailService emailService) {
        this.proposalRepos = proposalRepos;
        this.projectRepos = projectRepos;
        this.accountRepos = accountRepos;
        this.hirableConfig = hirableConfig;
        this.authContext = authContext;
        this.emailService = emailService;
    }

    @Override
    public Proposal create(Proposal proposal) {
        proposal.setProposalId(null);
        proposal.setFreelancer(accountRepos.getReferenceById(authContext.requireAccountId()));
        Project project = projectRepos.findByProjectId(proposal.getProject().getProjectId())
                .orElseThrow(() -> new InvalidInputException("Project does not exist"));
        proposal.setProject(project);

        if (project.getStatus() != Project.ProjectStatus.OPEN)
            throw new IllegalStateException("Project is not open");
        if (LocalDateTime.now().isAfter(project.getStartDate().minusDays(hirableConfig.getProposalApplicationCutoffDuration())))
            throw new IllegalStateException("Cannot send proposals for now");
        if (proposalRepos.findByProject_ProjectIdAndFreelancer_AccountIdAndStatus
                        (proposal.getProject().getProjectId(), proposal.getFreelancer().getAccountId(), Proposal.ProposalStatus.PENDING)
                .isPresent()) {
            throw new IllegalStateException("You already have a pending proposal for this project");
        }
        if (project.getMinBudget().compareTo(proposal.getBudget()) > 0 ||
                proposal.getProject().getMaxBudget().compareTo(proposal.getBudget()) < 0) {
            throw new InvalidInputException("Budget is not within project's budget range");
        }

        proposal.setStatus(Proposal.ProposalStatus.PENDING);
        return proposalRepos.save(proposal);
    }

    @Override
    public Proposal findById(long id) {
        return proposalRepos.findById(id).orElseThrow(
                () -> new IllegalArgumentException("Proposal does not exist")
        );
    }

    @Override
    public Page<Proposal> getAll(ListParams params) {
        var spec = OpenApiHelper.groupBy(params.<Proposal>toSpec(), "proposalId");
        return proposalRepos.findAll(spec, params.getPageable());
    }

    @Override
    @Transactional
    public Proposal acceptProposal(long proposalId) {
        Proposal proposal = findById(proposalId);
        authContext.requireAccountId(proposal.getProject().getClient().getAccountId()); // Client operation
        if (proposal.getStatus() != Proposal.ProposalStatus.PENDING) {
            throw new IllegalStateException("Proposal is not pending");
        }
        if (proposalRepos.countByProjectIdAndStatus(proposal.getProject().getProjectId(), Proposal.ProposalStatus.ACCEPTED) > 0) {
            throw new IllegalStateException("Project already has an accepted proposal");
        }
        if (proposal.getProject().getStatus() != Project.ProjectStatus.OPEN) {
            throw new IllegalStateException("Project is not OPEN");
        }

        proposal.getProject().setStatus(Project.ProjectStatus.IN_PROGRESS);
        proposal.setProject(projectRepos.save(proposal.getProject()));

        proposalRepos.saveAll(proposal.getProject().getProposals().stream()
                .filter(p -> p.getStatus() == Proposal.ProposalStatus.PENDING)
                .peek(p ->
                        p.setStatus(p.getProposalId() == proposalId ?
                                Proposal.ProposalStatus.ACCEPTED :
                                Proposal.ProposalStatus.REJECTED))
                .toList());

        return proposal;
    }

    @Override
    public Proposal rejectProposal(long proposalId,String rejectReason) {
        Proposal proposal = findById(proposalId);
        authContext.requireAccountId(proposal.getProject().getClient().getAccountId()); // Client operation

        if (proposal.getStatus() != Proposal.ProposalStatus.PENDING) {
            throw new IllegalStateException("Proposal is not pending");
        }
        if (proposal.getProject().getStatus() != Project.ProjectStatus.OPEN) {
            throw new IllegalStateException("Project is not OPEN");
        }
        proposal.setRejectReason(rejectReason);
        proposal.setStatus(Proposal.ProposalStatus.REJECTED);
        try
        {
            emailService.sendProposalRejectToFreelancer(proposalId);
        }catch (IOException ignored) {

        }

        return proposalRepos.save(proposal);
    }

    @Override
    public Proposal withdrawProposal(long proposalId) {
        Proposal proposal = findById(proposalId);
        authContext.requireAccountId(proposal.getFreelancer().getAccountId()); // Freelancer operation
        if (proposal.getStatus() != Proposal.ProposalStatus.PENDING) {
            throw new IllegalStateException("Proposal is not pending");
        }
        if (proposal.getProject().getStatus() != Project.ProjectStatus.OPEN) {
            throw new IllegalStateException("Project is not OPEN");
        }
        proposal.setStatus(Proposal.ProposalStatus.WITHDRAWN);
        return proposalRepos.save(proposal);
    }

    @Override
    public long countByProjectIdAndStatus(long projectId, Proposal.ProposalStatus status) {
        return proposalRepos.countByProjectIdAndStatus(projectId, status);
    }

    @Override
    public List<Proposal> findByProjectAndFreelancer(long projectId, long freelancerId) {
        return proposalRepos.findByProject_ProjectIdAndFreelancer_AccountIdOrderByProposalIdDesc(projectId, freelancerId);
    }
}
