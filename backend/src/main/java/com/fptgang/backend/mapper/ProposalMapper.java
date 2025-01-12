package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.AccountDto;
import com.fptgang.backend.api.model.ProposalDto;
import com.fptgang.model.Account;
import com.fptgang.model.Proposal;

public class ProposalMapper extends BaseMapper<ProposalDto, Proposal> {

    @Override
    public ProposalDto toDTO(Proposal entity) {
        if (entity == null) {
            return null;
        }

        ProposalDto proposalDto = new ProposalDto();
        proposalDto.setProposalId(entity.getProposalId() != null ? entity.getProposalId() : null);
        proposalDto.setProjectId(entity.getJobId() != null ? entity.getJobId() : null);
        proposalDto.setFreelancerId(entity.getFreelancerId() != null ? entity.getFreelancerId() : null);
        proposalDto.setStatus(mapRoleDto(entity.getStatus()));
        proposalDto.setCreatedAt(entity.getCreatedAt());
        proposalDto.setUpdatedAt(entity.getUpdatedAt());

        return proposalDto;
    }

    @Override
    public Proposal toEntity(ProposalDto dto) {
        if (dto == null) {
            return null;
        }

        Proposal proposal = new Proposal();

        if (dto.getProposalId() != null) {
            proposal.setProposalId(dto.getProposalId());
        }

        if (dto.getProjectId() != null) {
            proposal.setJobId(dto.getProjectId());  // Assuming projectId maps to jobId
        }

        if (dto.getFreelancerId() != null) {
            proposal.setFreelancerId(dto.getFreelancerId());
        }

        if (dto.getStatus() != null) {
            proposal.setStatus(mapRoleEntity(dto.getStatus()));
        }

        if (dto.getCreatedAt() != null) {
            proposal.setCreatedAt(dto.getCreatedAt());
        }

        if (dto.getUpdatedAt() != null) {
            proposal.setUpdatedAt(dto.getUpdatedAt());
        }

        return proposal;
    }

    private ProposalDto.StatusEnum mapRoleDto(Proposal.StatusEnum roleEnum) {
        if (roleEnum == null) {
            return null; // Or a default Role, e.g., Role.CLIENT
        }

        switch (roleEnum) {
            case PENDING:
                return ProposalDto.StatusEnum.PENDING;
            case ACCEPTED:
                return ProposalDto.StatusEnum.ACCEPTED;
            case REJECTED:
                return ProposalDto.StatusEnum.REJECTED;
            default:
                throw new IllegalArgumentException("Unknown RoleEnum: " + roleEnum);
        }
    }

    private Proposal.StatusEnum mapRoleEntity(ProposalDto.StatusEnum roleEnum) {
        if (roleEnum == null) {
            return null; // Or a default Role, e.g., Role.CLIENT
        }

        switch (roleEnum) {
            case PENDING:
                return Proposal.StatusEnum.PENDING;
            case ACCEPTED:
                return Proposal.StatusEnum.ACCEPTED;
            case REJECTED:
                return Proposal.StatusEnum.REJECTED;
            default:
                throw new IllegalArgumentException("Unknown RoleEnum: " + roleEnum);
        }
    }


}
