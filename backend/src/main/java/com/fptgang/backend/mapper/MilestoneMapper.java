package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.MilestoneDto;
import com.fptgang.backend.repository.MilestoneRepos;
import com.fptgang.model.Message;
import com.fptgang.model.Milestone;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;

@Component
public class MilestoneMapper extends BaseMapper<MilestoneDto, Milestone> {

    @Autowired
    private MilestoneRepos milestoneRepos;

    @Override
    public MilestoneDto toDTO(Milestone entity) {
        if (entity == null) {
            return null;
        }

        MilestoneDto milestoneDto = new MilestoneDto();
        milestoneDto.setMilestoneId(entity.getMilestoneId());
        milestoneDto.setProposalId(entity.getJobId());
        milestoneDto.setTitle(entity.getTitle());
        milestoneDto.setBudget(entity.getBudgetRatio() != null ?
                BigDecimal.valueOf(entity.getBudgetRatio()) : null);
        milestoneDto.setDeadline(entity.getDeadline());
        milestoneDto.setStatus(mapStatusDto(entity.getStatus()));
        milestoneDto.setCreatedAt(entity.getCreatedAt());
        milestoneDto.setUpdatedAt(entity.getUpdatedAt());
        milestoneDto.setIsVisible(entity.getStatus() != Milestone.StatusEnum.FAILED);

        return milestoneDto;
    }

    public Milestone toEntity(MilestoneDto dto) {
        if (dto == null) {
            return null;
        }

        Optional<Milestone> existingEntityOptional = milestoneRepos.findByMilestoneId(dto.getMilestoneId());
        if (existingEntityOptional.isPresent()) {
            Milestone existEntity = existingEntityOptional.get();

            existEntity.setTitle(dto.getTitle() != null ? dto.getTitle() : existEntity.getTitle());
            existEntity.setBudgetRatio(dto.getBudget() != null ? dto.getBudget().floatValue() : existEntity.getBudgetRatio().floatValue());
            existEntity.setDeadline(dto.getDeadline() != null ? dto.getDeadline() : existEntity.getDeadline());
            existEntity.setStatus(dto.getStatus() != null ? mapStatusEntity(dto.getStatus()) : existEntity.getStatus());
            existEntity.setJobId(dto.getProposalId() != null ? dto.getProposalId() : existEntity.getJobId()); // Add JobId
            existEntity.setCreatedAt(dto.getCreatedAt() != null ? dto.getCreatedAt() : existEntity.getCreatedAt()); // Add createdAt
            existEntity.setUpdatedAt(OffsetDateTime.now()); // Update updatedAt

            return existEntity;
        } else {
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
    }


    public MilestoneDto.StatusEnum mapStatusDto(Milestone.StatusEnum statusEnum) {
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

    public Milestone.StatusEnum mapStatusEntity(MilestoneDto.StatusEnum statusEnum) {
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
