package com.fptgang.backend.service.impl;

import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.model.Proposal;
import com.fptgang.backend.repository.ProposalRepos;
import com.fptgang.backend.service.ProposalService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.EntityUtil;
import com.fptgang.backend.util.OpenApiHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class ProposalServiceImpl implements ProposalService {

    @Autowired
    private ProposalRepos proposalRepos;

    @Override
    public Proposal create(Proposal proposal) {
        proposal.setProposalId(null);
        if(proposal.getProject().getStatus() != Project.ProjectStatus.OPEN) {
            throw new InvalidInputException("Project is not open");
        }
        if(proposal.getProject().getMinBudget().compareTo(
                proposal.getBudget()) > 0 || proposal.getProject().getMaxBudget().compareTo(proposal.getBudget()) < 0) {
            throw new InvalidInputException("Budget is not within project's budget range");
        }

        if(proposalRepos.findByProject_ProjectIdAndFreelancer_AccountIdAndStatus
                (proposal.getProject().getProjectId(), proposal.getFreelancer().getAccountId(), Proposal.ProposalStatus.PENDING)
                .isPresent()
        ) {
            throw new InvalidInputException("You already have a pending proposal for this project");
        }
        proposal.setStatus(Proposal.ProposalStatus.PENDING);
        return proposalRepos.save(proposal);
    }

    @Override
    public Proposal update(Proposal proposal) {
        if (proposal.getProposalId() == null ) {
            throw new IllegalArgumentException("Proposal does not exist");
        }
        var existing = proposalRepos.findById(proposal.getProposalId()).orElseThrow(
                () -> new IllegalArgumentException("Proposal does not exist"));
        EntityUtil.merge(existing, proposal);
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
    public Proposal acceptProposal(long proposalId, long currentUserId) {
        Proposal proposal = findById(proposalId);
        if(proposal.getProject().getClient().getAccountId() != currentUserId) {
            throw new InvalidInputException("You are not the client of this project");
        }
        if(proposal.getStatus() != Proposal.ProposalStatus.PENDING) {
            throw new InvalidInputException("Proposal is not pending");
        }
        if(proposal.getProject().getContract() != null) {
            throw new InvalidInputException("Project already has an active contract");
        }

        proposal.setStatus(Proposal.ProposalStatus.ACCEPTED);
        proposal.getProject().setStatus(Project.ProjectStatus.IN_PROGRESS);
        proposal=update(proposal);
        List<Proposal> proposals = proposalRepos.findByProject_ProjectId(proposal.getProject().getProjectId());
        for (Proposal p : proposals) {
            if (!Objects.equals(p.getProposalId(), proposal.getProposalId()) &&
                    p.getStatus() == Proposal.ProposalStatus.PENDING) {
                p.setStatus(Proposal.ProposalStatus.REJECTED);
                update(p);
            }
        }

        return proposal;
    }

    @Override
    public Proposal rejectProposal(long proposalId, long currentUserId) {
        Proposal proposal = findById(proposalId);

        if(proposal.getProject().getClient().getAccountId() != currentUserId) {
            throw new InvalidInputException("You are not the client of this project");
        }
        if(proposal.getStatus() != Proposal.ProposalStatus.PENDING) {
            throw new InvalidInputException("Proposal is not pending");
        }
        if(proposal.getProject().getContract() != null) {
            throw new InvalidInputException("Project already has an active contract");
        }

        proposal.setStatus(Proposal.ProposalStatus.REJECTED);
        proposal=update(proposal);
        return proposal;
    }

    @Override
    public Proposal withdrawProposal(long proposalId, long currentUserId) {
        Proposal proposal = findById(proposalId);
        if(proposal.getFreelancer().getAccountId() != currentUserId) {
            throw new InvalidInputException("You are not the freelancer of this proposal");
        }
        if(proposal.getStatus() != Proposal.ProposalStatus.PENDING) {
            throw new InvalidInputException("Proposal is not pending");
        }
        proposal.setStatus(Proposal.ProposalStatus.WITHDRAWN);
        proposal=update(proposal);
        return proposal;
    }
}
