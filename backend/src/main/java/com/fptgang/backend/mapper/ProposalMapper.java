package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProposalDto;
import com.fptgang.backend.model.Proposal;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.repository.ProposalRepos;
import com.fptgang.backend.util.DateTimeUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@Component
public class ProposalMapper extends BaseMapper<ProposalDto, Proposal> {
    private final ProposalRepos proposalRepos;
    private final ProjectRepos projectRepos;
    private final AccountRepos accountRepos;
    private final FileMapper fileMapper;

    public ProposalMapper(ProposalRepos proposalRepos, ProjectRepos projectRepos, AccountRepos accountRepos, FileMapper fileMapper) {
        this.proposalRepos = proposalRepos;
        this.projectRepos = projectRepos;
        this.accountRepos = accountRepos;
        this.fileMapper = fileMapper;
    }

    @Override
    public Proposal toEntity(ProposalDto dto) {
        if (dto == null) {
            return null;
        }

        Proposal entity = new Proposal();
        entity.setProposalId(dto.getProposalId());

        if (dto.getProjectId() != null) {
            entity.setProject(projectRepos.findByProjectId(dto.getProjectId())
                    .orElseThrow(() -> new IllegalArgumentException("Project not found")));
        }

        if (dto.getFreelancerId() != null) {
            entity.setFreelancer(accountRepos.findByAccountId(dto.getFreelancerId())
                    .orElseThrow(() -> new IllegalArgumentException("Freelancer not found")));
        }

        entity.setStatus(mapRoleEntity(dto.getStatus()));
        entity.setNotes(dto.getNotes());
        entity.setFiles(fileMapper.toEntities(dto.getFiles()));
        entity.setCreatedAt(DateTimeUtil.fromOffsetToLocal(dto.getCreatedAt()));
        entity.setUpdatedAt(DateTimeUtil.fromOffsetToLocal(dto.getUpdatedAt()));

        return entity;
    }

    @Override
    public ProposalDto toDTO(Proposal entity, DetailLevel level) {
        if (entity == null) {
            return null;
        }

        ProposalDto dto = new ProposalDto();
        dto.setProposalId(entity.getProposalId());
        dto.setProjectId(entity.getProject().getProjectId());
        dto.setFreelancerId(entity.getFreelancer().getAccountId());
        dto.setStatus(mapRoleDto(entity.getStatus()));
        dto.setNotes(entity.getNotes());
        dto.setFiles(entity.getFiles().stream().map((file -> {
            return fileMapper.toDTO(file, DetailLevel.REFERENCE);
        }
        )).toList());
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

    public ProposalDto.StatusEnum mapRoleDto(Proposal.ProposalStatus roleEnum) {
        if (roleEnum == null) {
            return null;
        }

        return switch (roleEnum) {
            case PENDING -> ProposalDto.StatusEnum.PENDING;
            case ACCEPTED -> ProposalDto.StatusEnum.ACCEPTED;
            case REJECTED -> ProposalDto.StatusEnum.REJECTED;
            default -> throw new IllegalArgumentException("Unknown RoleEnum: " + roleEnum);
        };
    }

    public Proposal.ProposalStatus mapRoleEntity(ProposalDto.StatusEnum roleEnum) {
        if (roleEnum == null) {
            return null;
        }

        return switch (roleEnum) {
            case PENDING -> Proposal.ProposalStatus.PENDING;
            case ACCEPTED -> Proposal.ProposalStatus.ACCEPTED;
            case REJECTED -> Proposal.ProposalStatus.REJECTED;
            default -> throw new IllegalArgumentException("Unknown RoleEnum: " + roleEnum);
        };
    }
}