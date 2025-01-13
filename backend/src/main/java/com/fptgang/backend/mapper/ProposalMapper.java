package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.AccountDto;
import com.fptgang.backend.api.model.ProposalDto;
import com.fptgang.backend.repository.ProposalRepos;
import com.fptgang.model.Account;
import com.fptgang.model.Message;
import com.fptgang.model.Proposal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.Optional;

@Component
public class ProposalMapper extends BaseMapper<ProposalDto, Proposal> {


    @Autowired
    private ProposalRepos proposalRepos;

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
        Optional<Proposal> existingEntityOptional = proposalRepos.findByProposalId(dto.getProposalId());
        if (existingEntityOptional.isPresent()) {
            Proposal existEntity = existingEntityOptional.get();
            existEntity.setJobId(dto.getProjectId() != null ? dto.getProjectId() : existEntity.getJobId());
            existEntity.setUpdatedAt(OffsetDateTime.from(Instant.now()));
            existEntity.setFreelancerId(dto.getFreelancerId() != null ? dto.getFreelancerId() : existEntity.getFreelancerId());
            existEntity.setStatus(dto.getStatus() != null ? mapRoleEntity(dto.getStatus()) : existEntity.getStatus());

            return existEntity;
        }


        else{
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
    }

    public ProposalDto.StatusEnum mapRoleDto(Proposal.StatusEnum roleEnum) {
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

    public Proposal.StatusEnum mapRoleEntity(ProposalDto.StatusEnum roleEnum) {
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
