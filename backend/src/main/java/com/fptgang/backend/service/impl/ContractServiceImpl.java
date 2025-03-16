package com.fptgang.backend.service.impl;

import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.*;
import com.fptgang.backend.repository.ContractRepos;
import com.fptgang.backend.repository.MilestoneRepos;

import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.security.AuthContext;
import com.fptgang.backend.service.*;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.OpenApiHelper;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class ContractServiceImpl implements ContractService {

    private final ContractRepos contractRepos;
    private final MilestoneRepos milestoneRepos;
    private final ProjectRepos projectRepos;
    private final ProposalService proposalService;
    private final MilestoneService milestoneService;
    private final AuthContext authContext;

    public ContractServiceImpl(ContractRepos contractRepos,
                               MilestoneRepos milestoneRepos,
                               ProjectRepos projectRepos,
                               ProposalService proposalService,
                               MilestoneService milestoneService,
                               AuthContext authContext) {
        this.contractRepos = contractRepos;
        this.milestoneRepos = milestoneRepos;
        this.projectRepos = projectRepos;
        this.proposalService = proposalService;
        this.milestoneService = milestoneService;
        this.authContext = authContext;
    }

    @Override
    @Transactional
    public Contract create(Long proposalId) {
        Proposal accepted = proposalService.acceptProposal(proposalId); // already check access
        Project project = accepted.getProject();
        Account client = project.getClient();
        Milestone firstMilestone = project.getMilestones().stream()
                .filter(Milestone::getIsVisible)
                .findFirst().orElseThrow(() -> new IllegalStateException("Project has no visible milestones"));
        BigDecimal firstMilestoneBudget = firstMilestone.getBudgetRatio().multiply(accepted.getBudget());
        if (client.getBalance().compareTo(firstMilestoneBudget) < 0) {
            throw new IllegalStateException("Not enough balance to fund the first milestone");
        }
        Contract contract = Contract.builder()
                .budget(accepted.getBudget())
                .freelancer(accepted.getFreelancer())
                .project(project)
                .proposal(accepted)
                .status(Contract.ContractStatus.UNSIGNED)
                .build();
        contract = contractRepos.save(contract);
        project.setContract(contract);
        contract.setProject(projectRepos.save(project));
        milestoneService.depositFund(firstMilestone);
        return contract;
    }

    @Override
    public Contract findById(long id) {
        return contractRepos.findById(id)
                            .orElseThrow(
                                    () -> new IllegalArgumentException("Contract does not exist")
                            );
    }

    @Override
    public Page<Contract> getAll(ListParams params) {
        var spec = OpenApiHelper.groupBy(params.<Contract>toSpec(),
                "contractId");
        return contractRepos.findAll(spec,
                params.getPageable());
    }

    @Override
    @Transactional
    public Contract signContract(long contractId) {
        Contract contract = contractRepos.findById(contractId)
                .orElseThrow(() -> new InvalidInputException("Contract does not exist"));
        authContext.requireAccountId(contract.getFreelancer().getAccountId()); // Freelancer operation
        System.out.println("contract " + contract.getStatus());

        if (contract.getStatus() == Contract.ContractStatus.SIGNED) {
            throw new IllegalStateException("Contract is already signed");
        }

        if (contract.getStatus() == Contract.ContractStatus.TERMINATED) {
            throw new IllegalStateException("Contract is terminated");
        }

        Project project = contract.getProject();
        if (project.getStatus() != Project.ProjectStatus.IN_PROGRESS) {
            throw new IllegalArgumentException("Project must be in progress to sign the contract");
        }

        contract.setStatus(Contract.ContractStatus.SIGNED);
        contract.setSignedAt(LocalDateTime.now());
        contract = contractRepos.save(contract);

        Milestone firstMilestone = project.getMilestones().stream()
                .filter(Milestone::getIsVisible)
                .findFirst().orElseThrow(() -> new IllegalStateException("Project has no visible milestones"));
        firstMilestone.setStatus(Milestone.MilestoneStatus.IN_PROGRESS);
        firstMilestone = milestoneRepos.save(firstMilestone);

        project.setActiveMilestone(firstMilestone);
        project.setContract(contract);
        projectRepos.save(project);

        return contract;
    }

    @Override
    public Contract terminateContract(Contract contract) {
        if (contract.getStatus() == Contract.ContractStatus.TERMINATED) {
            throw new IllegalStateException("Contract is already terminated");
        }
        if (contract.getStatus() != Contract.ContractStatus.SIGNED) {
            throw new IllegalStateException("Contract is not signed");
        }
        contract.setStatus(Contract.ContractStatus.TERMINATED);
        return contractRepos.save(contract);
    }
}
