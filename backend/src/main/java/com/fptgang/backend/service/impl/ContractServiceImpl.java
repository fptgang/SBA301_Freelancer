package com.fptgang.backend.service.impl;

import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.Contract;
import com.fptgang.backend.model.Milestone;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.repository.ContractRepos;
import com.fptgang.backend.repository.MilestoneRepos;

import com.fptgang.backend.service.ContractService;
import com.fptgang.backend.service.ProposalService;
import com.fptgang.backend.service.TransactionService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.OpenApiHelper;
import com.fptgang.backend.util.SecurityUtil;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;


@Service
public class ContractServiceImpl implements ContractService {

    @Autowired
    private ContractRepos contractRepos;
    @Autowired
    private MilestoneRepos milestoneRepos;



    @Override
    public Contract create(Contract contract) {
        contract.setContractId(null);
        if (contractRepos.findByProject_ProjectIdAndStatus(contract.getProject().getProjectId(), Contract.ContractStatus.SIGNED).isPresent()) {
            throw new IllegalArgumentException("Project already has a signed contract");
        }
        if (contractRepos.findByProject_ProjectIdAndStatus(contract.getProject().getProjectId(), Contract.ContractStatus.UNSIGNED).isPresent()) {
            throw new IllegalArgumentException("Project already has an unsigned contract");
        }
        Account client = accountService.findById(contract.getProject().getClient().getAccountId());
        Milestone firstMilestone = contract.getProject().getMilestones().getFirst();
        BigDecimal firstMilestoneBudget = firstMilestone.getBudgetRatio().multiply(contract.getBudget());
        if (client.getBalance().compareTo(firstMilestoneBudget) < 0) {
            throw new IllegalArgumentException("Client does not have enough balance");
        }
        proposalService.acceptProposal(contract.getProposal().getProposalId(), SecurityUtil.requireCurrentUserId());
        contract.setStatus(Contract.ContractStatus.UNSIGNED);
        firstMilestone.getProject().setContract(contract);
        transactionService.createEscrowDeposit(firstMilestone);
        return contractRepos.save(contract);
    }

    @Override
    public Contract update(Contract contract) {
//        if (contract.getContractId() == null) {
//            throw new IllegalArgumentException("Contract does not exist");
//        }
//        Contract existing = contractRepos.findById(contract.getContractId())
//                .orElseThrow(() -> new IllegalArgumentException("Contract does not exist"));
//        EntityUtil.merge(existing, contract);
        throw new IllegalArgumentException("Contract cant be updated");
//        return contractRepos.save(contract);
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
    public Contract signContract(long id) {
        // Find the contract
        Contract contract = contractRepos.findById(id)
                                         .orElseThrow(() -> new IllegalArgumentException("Contract does not exist"));

        // Check if contract is already signed
        if (contract.getStatus() == Contract.ContractStatus.SIGNED) {
            throw new IllegalArgumentException("Contract is already signed");
        }

        // Check if the current user is the freelancer
        Long currentUserId = SecurityUtil.requireCurrentUserId();
        if (!Objects.equals(contract.getFreelancer()
                                    .getAccountId(),
                currentUserId)) {
            throw new IllegalArgumentException("Only the freelancer can sign this contract");
        }

        // Check if project status is IN_PROGRESS
        Project project = contract.getProject();
        if (project.getStatus() != Project.ProjectStatus.IN_PROGRESS) {
            throw new IllegalArgumentException("Project must be in progress to sign the contract");
        }

        // Sign the contract

        contract.setStatus(Contract.ContractStatus.SIGNED);
        contract.setSignedAt(LocalDateTime.now());

        // Update the first milestone to be active
        List<Milestone> milestones = project.getMilestones()
                                            .stream()
                                            .sorted(Comparator.comparing(Milestone::getDeadline))
                                            .toList();

        if (!milestones.isEmpty()) {
            Milestone firstMilestone = milestones.get(0);
            firstMilestone.setStatus(Milestone.MilestoneStatus.IN_PROGRESS);
            // Save the milestone
            milestoneRepos.save(firstMilestone);
        } else {
            throw new IllegalArgumentException("Project has no milestones");
        }

        // Save and return the updated contract
        return contractRepos.save(contract);
    }

    @Override
    public Contract terminateContract(long id) {
        Contract contract = contractRepos.findById(id)
                                         .orElseThrow(
                                                 () -> new IllegalArgumentException("Contract does not exist")
                                         );
        if (contract.getStatus() == Contract.ContractStatus.TERMINATED) {
            throw new IllegalArgumentException("Contract is already terminated");
        }
        if (SecurityUtil.requireCurrentUserId() != contract.getProject()
                                                           .getClient()
                                                           .getAccountId() ||

                SecurityUtil.hasPermission(Role.STAFF) || SecurityUtil.hasPermission(Role.ADMIN)) {
            throw new IllegalArgumentException("You are not allowed to terminate this contract");
        }
        contract.setStatus(Contract.ContractStatus.TERMINATED);
        return contractRepos.save(contract);
    }
}
