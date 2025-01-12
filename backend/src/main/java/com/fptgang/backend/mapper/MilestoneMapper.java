package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.MilestoneDto;
import com.fptgang.model.Milestone;

import java.math.BigDecimal;

public class MilestoneMapper extends BaseMapper<MilestoneDto, Milestone> {

    @Override
    public MilestoneDto toDTO(Milestone entity) {
        if (entity == null) {
            return null;
        }

        MilestoneDto milestoneDto = new MilestoneDto();
        milestoneDto.setMilestoneId(entity.getMilestoneId());
        milestoneDto.setProposalId(entity.getJobId());  // Assuming jobId maps to proposalId
        milestoneDto.setTitle(entity.getTitle());
        milestoneDto.setBudget(entity.getBudgetRatio() != null ?
                BigDecimal.valueOf(entity.getBudgetRatio()) : null);  // Convert Float to BigDecimal
        milestoneDto.setDeadline(entity.getDeadline());
        milestoneDto.setStatus(mapStatusDto(entity.getStatus()));
        milestoneDto.setCreatedAt(entity.getCreatedAt());
        milestoneDto.setUpdatedAt(entity.getUpdatedAt());
        milestoneDto.setIsVisible(entity.getStatus() != Milestone.StatusEnum.FAILED); // Example condition for visibility

        return milestoneDto;
    }

    public Milestone toEntity(MilestoneDto dto) {
        if (dto == null) {
            return null;
        }

        Milestone milestone = new Milestone();

        if (dto.getMilestoneId() != null) {
            milestone.setMilestoneId(dto.getMilestoneId());
        }
        if (dto.getProposalId() != null) {
            milestone.setJobId(dto.getProposalId());
        }
        if (dto.getTitle() != null) {
            milestone.setTitle(dto.getTitle());
        }
        if (dto.getBudget() != null) {
            milestone.setBudgetRatio(dto.getBudget().floatValue());
        }
        if (dto.getDeadline() != null) {
            milestone.setDeadline(dto.getDeadline());
        }
        if (dto.getStatus() != null) {
            milestone.setStatus(mapStatusEntity(dto.getStatus()));
        }
        if (dto.getCreatedAt() != null) {
            milestone.setCreatedAt(dto.getCreatedAt());
        }
        if (dto.getUpdatedAt() != null) {
            milestone.setUpdatedAt(dto.getUpdatedAt());
        }

        return milestone;
    }


    private MilestoneDto.StatusEnum mapStatusDto(Milestone.StatusEnum statusEnum) {
        if (statusEnum == null) {
            return null; // Or a default Status, e.g., Status.PENDING
        }

        switch (statusEnum) {
            case PENDING:
                return MilestoneDto.StatusEnum.PENDING;
            case COMPLETED:
                return MilestoneDto.StatusEnum.FINISHED;  // Example: map COMPLETED to FINISHED
            case FAILED:
                return MilestoneDto.StatusEnum.TERMINATED;
            default:
                throw new IllegalArgumentException("Unknown StatusEnum: " + statusEnum);
        }
    }

    private Milestone.StatusEnum mapStatusEntity(MilestoneDto.StatusEnum statusEnum) {
        if (statusEnum == null) {
            return null; // Or a default Status, e.g., Status.PENDING
        }

        switch (statusEnum) {
            case PENDING:
                return Milestone.StatusEnum.PENDING;
            case FINISHED:
                return Milestone.StatusEnum.COMPLETED;  // Example: map FINISHED to COMPLETED
            case TERMINATED:
                return Milestone.StatusEnum.FAILED;
            default:
                throw new IllegalArgumentException("Unknown StatusEnum: " + statusEnum);
        }
    }
}
