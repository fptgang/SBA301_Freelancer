package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ContractDto;
import com.fptgang.backend.model.Contract;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.repository.ContractRepos;
import com.fptgang.backend.repository.ProposalRepos;
import com.fptgang.backend.util.DateTimeUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@Component
public class ContractMapper extends BaseMapper<ContractDto, Contract> {
    private final ContractRepos contractRepos;
    private final ProjectRepos projectRepos;
    private final AccountRepos accountRepos;
    private final ProposalRepos proposalRepos;

    public ContractMapper(ContractRepos contractRepos, ProjectRepos projectRepos, AccountRepos accountRepos, ProposalRepos proposalRepos) {
        this.contractRepos = contractRepos;
        this.projectRepos = projectRepos;
        this.accountRepos = accountRepos;
        this.proposalRepos = proposalRepos;
    }

    @Override
    public Contract toEntity(ContractDto dto) {
        if (dto == null) {
            return null;
        }

        Contract entity = new Contract();
        entity.setContractId(dto.getContractId());

        if (dto.getProjectId() != null) {
            entity.setProject(projectRepos.findByProjectId(dto.getProjectId())
                    .orElseThrow(() -> new IllegalArgumentException("Project not found")));
        }

        if (dto.getProposalId() != null) {
            entity.setProposal(proposalRepos.findByProposalId(dto.getProposalId())
                    .orElseThrow(() -> new IllegalArgumentException("Proposal not found")));
        }

        entity.setCreatedAt(DateTimeUtil.fromOffsetToLocal(dto.getCreatedAt()));
        entity.setUpdatedAt(DateTimeUtil.fromOffsetToLocal(dto.getUpdatedAt()));

        return entity;
    }

    @Override
    public ContractDto toDTO(Contract entity, DetailLevel level) {
        if (entity == null) {
            return null;
        }

        ContractDto dto = new ContractDto();
        dto.setContractId(entity.getContractId());
        dto.setProjectId(entity.getProject().getProjectId());
        dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));
        dto.setUpdatedAt(DateTimeUtil.fromLocalToOffset(entity.getUpdatedAt()));

        if (level == DetailLevel.REFERENCE) {
            return dto; // those fields are enough
        }

        if (level == DetailLevel.SUMMARY) {
            return dto; // those fields are enough
        }

        // Add more fields if needed for other detail levels

        return dto;
    }
}