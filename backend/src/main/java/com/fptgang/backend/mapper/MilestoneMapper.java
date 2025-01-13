package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.MilestoneDto;
import com.fptgang.backend.model.Proposal;
import com.fptgang.backend.repository.MilestoneRepos;
import com.fptgang.backend.model.Milestone;
import com.fptgang.backend.repository.ProposalRepos;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Optional;

@Component
public class MilestoneMapper extends BaseMapper<MilestoneDto, Milestone> {

    @Autowired
    private MilestoneRepos milestoneRepos;

    @Autowired
    private ProposalRepos proposalRepos;

    @Override
    public MilestoneDto toDTO(Milestone entity) {
        if (entity == null) {
            return null;
        }

        MilestoneDto milestoneDto = new MilestoneDto();
        milestoneDto.setMilestoneId(entity.getMilestoneId());
        milestoneDto.setProposalId(entity.getProposal().getProposalId());
        milestoneDto.setTitle(entity.getTitle());
        milestoneDto.setBudget(entity.getBudget() != null ? entity.getBudget() : null);
        milestoneDto.setDeadline(OffsetDateTime.from(entity.getDeadline()));
        milestoneDto.setStatus(mapStatusDto(entity.getStatus()));
        milestoneDto.setCreatedAt(OffsetDateTime.from(entity.getCreatedAt()));
        milestoneDto.setUpdatedAt(OffsetDateTime.from(entity.getUpdatedAt()));

        return milestoneDto;
    }

    public Milestone toEntity(MilestoneDto dto) {
        if (dto == null) {
            return null;
        }

        Optional<Milestone> existingEntityOptional = milestoneRepos.findByMilestoneId(dto.getMilestoneId());
        Optional<Proposal> proposalOptional = proposalRepos.findByProposalId(dto.getProposalId());
        Proposal proposal = proposalOptional.get();
        if (existingEntityOptional.isPresent()) {
            Milestone existEntity = existingEntityOptional.get();

            existEntity.setTitle(dto.getTitle() != null ? dto.getTitle() : existEntity.getTitle());
            existEntity.setBudget(BigDecimal.valueOf(dto.getBudget() != null ? dto.getBudget().floatValue() : existEntity.getBudget().floatValue()));
            existEntity.setDeadline(dto.getDeadline() != null ? dto.getDeadline().toLocalDateTime() : existEntity.getDeadline());
            existEntity.setStatus(dto.getStatus() != null ? mapStatusEntity(dto.getStatus()) : existEntity.getStatus());
            existEntity.setProposal(dto.getProposalId() != null ? proposal : existEntity.getProposal()); // Add JobId
            existEntity.setCreatedAt(dto.getCreatedAt() != null ? dto.getCreatedAt().toLocalDateTime() : existEntity.getCreatedAt()); // Add createdAt
            existEntity.setUpdatedAt(LocalDateTime.from(Instant.now())); // Update updatedAt
            existEntity.setVisible( dto.getIsVisible() != null ? dto.getIsVisible() : existEntity.isVisible());

            return existEntity;
        } else {
            Milestone milestone = new Milestone();

            if (dto.getMilestoneId() != null) {
                milestone.setMilestoneId(dto.getMilestoneId());
            }
            if (dto.getProposalId() != null) {
                milestone.setProposal(proposal);
            }
            if (dto.getTitle() != null) {
                milestone.setTitle(dto.getTitle());
            }
            if (dto.getBudget() != null) {
                milestone.setBudget(BigDecimal.valueOf(dto.getBudget().floatValue()));
            }
            if (dto.getDeadline() != null) {
                milestone.setDeadline(dto.getDeadline().toLocalDateTime());
            }
            if (dto.getStatus() != null) {
                milestone.setStatus(mapStatusEntity(dto.getStatus()));
            }
            if (dto.getCreatedAt() != null) {
                milestone.setCreatedAt(dto.getCreatedAt().toLocalDateTime());
            }
            if (dto.getUpdatedAt() != null) {
                milestone.setUpdatedAt(dto.getUpdatedAt().toLocalDateTime());
            }
            if (dto.getIsVisible() != null) {
                milestone.setVisible(dto.getIsVisible());
            }

            return milestone;
        }
    }


    public MilestoneDto.StatusEnum mapStatusDto(Milestone.MilestoneStatus statusEnum) {
        if (statusEnum == null) {
            return null; // Or a default Status, e.g., Status.PENDING
        }

        switch (statusEnum) {
            case PENDING:
                return MilestoneDto.StatusEnum.PENDING;
            case TERMINATED:
                return MilestoneDto.StatusEnum.TERMINATED;  // Example: map COMPLETED to FINISHED
            case IN_PROGRESS:
                return MilestoneDto.StatusEnum.IN_PROGRESS;
            case FINISHED:
                return MilestoneDto.StatusEnum.FINISHED;
            default:
                throw new IllegalArgumentException("Unknown StatusEnum: " + statusEnum);
        }
    }

    public Milestone.MilestoneStatus mapStatusEntity(MilestoneDto.StatusEnum statusEnum) {
        if (statusEnum == null) {
            return null; // Or a default Status, e.g., Status.PENDING
        }

        switch (statusEnum) {
            case PENDING:
                return Milestone.MilestoneStatus.PENDING;
            case FINISHED:
                return Milestone.MilestoneStatus.FINISHED;  // Example: map FINISHED to COMPLETED
            case TERMINATED:
                return Milestone.MilestoneStatus.TERMINATED;
            case IN_PROGRESS:
                return Milestone.MilestoneStatus.IN_PROGRESS;
            default:
                throw new IllegalArgumentException("Unknown StatusEnum: " + statusEnum);
        }
    }
}
