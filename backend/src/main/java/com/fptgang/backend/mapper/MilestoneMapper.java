package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.MilestoneDto;
import com.fptgang.backend.model.Milestone;
import com.fptgang.backend.repository.MilestoneRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.util.DateTimeUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Slf4j
@Component
public class MilestoneMapper extends BaseMapper<MilestoneDto, Milestone> {
    private final MilestoneRepos milestoneRepos;
    private final ProjectRepos projectRepos;
    private final FileMapper fileMapper;

    public MilestoneMapper(MilestoneRepos milestoneRepos, ProjectRepos projectRepos, FileMapper fileMapper) {
        this.milestoneRepos = milestoneRepos;
        this.projectRepos = projectRepos;
        this.fileMapper = fileMapper;
    }

    @Override
    public Milestone toEntity(MilestoneDto dto) {
        if (dto == null) {
            return null;
        }

        Milestone entity = new Milestone();
        entity.setMilestoneId(dto.getMilestoneId());

        if (dto.getTitle() != null) {
            entity.setTitle(dto.getTitle());
        }

        if (dto.getDescription() != null) {
            entity.setDescription(dto.getDescription());
        }

        if (dto.getDeadline() != null) {
            entity.setDeadline(DateTimeUtil.fromOffsetToLocal(dto.getDeadline()));
        }

        if (dto.getStatus() != null) {
            entity.setStatus(mapStatusEntity(dto.getStatus()));
        }

        if (dto.getIsVisible() != null) {
            entity.setIsVisible(dto.getIsVisible());
        }

        if (dto.getProjectId() != null) {
            entity.setProject(projectRepos.findByProjectId(dto.getProjectId())
                    .orElseThrow(() -> new IllegalArgumentException("Project not found")));
        }

        if (dto.getDeliverables() != null) {
            entity.setDeliverables(dto.getDeliverables().stream()
                    .map(fileMapper::toEntity)
                    .collect(Collectors.toList()));
        }


        entity.setCreatedAt(DateTimeUtil.fromOffsetToLocal(dto.getCreatedAt()));
        entity.setUpdatedAt(DateTimeUtil.fromOffsetToLocal(dto.getUpdatedAt()));

        return entity;
    }

    @Override
    public MilestoneDto toDTO(Milestone entity, DetailLevel level) {
        if (entity == null) {
            return null;
        }

        MilestoneDto dto = new MilestoneDto();
        dto.setMilestoneId(entity.getMilestoneId());
        dto.setTitle(entity.getTitle());

        if (level == DetailLevel.REFERENCE) {
            return dto; // those fields are enough
        }
        dto.setDescription(entity.getDescription());
        dto.setDeadline(DateTimeUtil.fromLocalToOffset(entity.getDeadline()));
        dto.setStatus(mapStatusDto(entity.getStatus()));
        dto.setIsVisible(entity.getIsVisible());

        if (level == DetailLevel.SUMMARY) {
            return dto; // those fields are enough
        }

        dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));
        dto.setUpdatedAt(DateTimeUtil.fromLocalToOffset(entity.getUpdatedAt()));

        if (entity.getProject() != null) {
            dto.setProjectId(entity.getProject().getProjectId());
        }

        if (entity.getDeliverables() != null) {
            dto.setDeliverables(entity.getDeliverables().stream()
                    .map(file -> fileMapper.toDTO(file, DetailLevel.REFERENCE))
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public MilestoneDto.StatusEnum mapStatusDto(Milestone.MilestoneStatus statusEnum) {
        if (statusEnum == null) {
            return null;
        }

        switch (statusEnum) {
            case PENDING:
                return MilestoneDto.StatusEnum.PENDING;
            case TERMINATED:
                return MilestoneDto.StatusEnum.TERMINATED;
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
            return null;
        }

        switch (statusEnum) {
            case PENDING:
                return Milestone.MilestoneStatus.PENDING;
            case TERMINATED:
                return Milestone.MilestoneStatus.TERMINATED;
            case IN_PROGRESS:
                return Milestone.MilestoneStatus.IN_PROGRESS;
            case FINISHED:
                return Milestone.MilestoneStatus.FINISHED;
            default:
                throw new IllegalArgumentException("Unknown StatusEnum: " + statusEnum);
        }
    }
}