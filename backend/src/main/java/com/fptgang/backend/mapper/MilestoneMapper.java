package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.MilestoneDto;
import com.fptgang.backend.model.Milestone;
import com.fptgang.backend.repository.MilestoneRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class MilestoneMapper extends BaseMapper<MilestoneDto, Milestone> {

    @Autowired
    private MilestoneRepos milestoneRepos;

    @Autowired
    private ProjectRepos projectRepos;

    @Override
    public MilestoneDto toDTO(Milestone entity) {
        if (entity == null) {
            return null;
        }

        MilestoneDto milestoneDto = new MilestoneDto();
        milestoneDto.setMilestoneId(entity.getMilestoneId());
        milestoneDto.setProjectId(entity.getProject().getProjectId());
        milestoneDto.setTitle(entity.getTitle());
        milestoneDto.setBudget(entity.getBudget());
        milestoneDto.setDeadline(DateTimeUtil.fromLocalToOffset(entity.getDeadline()));
        milestoneDto.setStatus(mapStatusDto(entity.getStatus()));
        milestoneDto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));
        milestoneDto.setUpdatedAt(DateTimeUtil.fromLocalToOffset(entity.getUpdatedAt()));
        milestoneDto.setIsVisible(entity.isVisible());

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
            existEntity.setBudget(dto.getBudget() != null ? dto.getBudget() : existEntity.getBudget());
            existEntity.setDeadline(dto.getDeadline() != null ? DateTimeUtil.fromOffsetToLocal(dto.getDeadline()) : existEntity.getDeadline());
            existEntity.setStatus(dto.getStatus() != null ? mapStatusEntity(dto.getStatus()) : existEntity.getStatus());
            existEntity.setVisible(dto.getIsVisible() != null ? dto.getIsVisible() : existEntity.isVisible());

            // NOTE: Cannot change linked proposal
            //existEntity.setProposal(dto.getProposalId() != null ? proposalRepos.findByProposalId(dto.getProposalId())
            //        .orElseThrow(() -> new IllegalArgumentException("Proposal not found")) : existEntity.getProposal()); // Add JobId

            return existEntity;
        } else {
            Milestone milestone = new Milestone();
            milestone.setMilestoneId(dto.getMilestoneId());

            if (dto.getProjectId() != null) {
                milestone.setProject(projectRepos.findByProjectId(dto.getProjectId())
                        .orElseThrow(() -> new IllegalArgumentException("Project not found")));
            }
            if (dto.getTitle() != null) {
                milestone.setTitle(dto.getTitle());
            }
            if (dto.getBudget() != null) {
                milestone.setBudget(dto.getBudget());
            }
            if (dto.getDeadline() != null) {
                milestone.setDeadline(DateTimeUtil.fromOffsetToLocal(dto.getDeadline()));
            }
            if (dto.getStatus() != null) {
                milestone.setStatus(mapStatusEntity(dto.getStatus()));
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
