package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.MilestoneDto;
import com.fptgang.backend.api.model.MilestoneFundStatusDto;
import com.fptgang.backend.api.model.MilestoneStatusDto;
import com.fptgang.backend.model.Milestone;
import com.fptgang.backend.repository.FileRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.security.AuthContext;
import com.fptgang.backend.util.DateTimeUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class MilestoneMapper extends BaseMapper<MilestoneDto, Milestone> {
    private final ProjectRepos projectRepos;
    private final FileRepos fileRepos;
    private final FileMapper fileMapper;
    private final AuthContext authContext;

    public MilestoneMapper(ProjectRepos projectRepos,
                           FileRepos fileRepos,
                           FileMapper fileMapper, AuthContext authContext) {
        this.projectRepos = projectRepos;
        this.fileRepos = fileRepos;
        this.fileMapper = fileMapper;
        this.authContext = authContext;
    }

    @Override
    public Milestone toEntity(MilestoneDto dto) {
        if (dto == null) {
            return null;
        }

        Milestone entity = new Milestone();
        entity.setMilestoneId(dto.getMilestoneId());

        if (dto.getProjectId() != null) {
            entity.setProject(projectRepos.getReferenceById(dto.getProjectId()));
        }
        entity.setDescription(dto.getDescription());
        entity.setTitle(dto.getTitle());
        entity.setBudgetRatio(dto.getBudgetRatio());
        entity.setDeadline(DateTimeUtil.fromOffsetToLocal(dto.getDeadline()));
        entity.setStatus(dto.getStatus() == null ? null : Milestone.MilestoneStatus.valueOf(dto.getStatus().name()));
        entity.setFundStatus(dto.getFundStatus() == null ? null : Milestone.FundStatus.valueOf(dto.getFundStatus().name()));
        entity.setIsVisible(dto.getIsVisible());
        entity.setDeliverables(dto.getDeliverables() == null ? null : dto.getDeliverables().stream()
                .filter(e -> e.getFileId() != null)
                .map(e -> fileRepos.getReferenceById(e.getFileId()))
                .toList());
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
        dto.setIsVisible(entity.getIsVisible());
        dto.setProjectId(entity.getProject().getProjectId());

        if (level == DetailLevel.REFERENCE) {
            return dto; // those fields are enough
        }

        dto.setDescription(entity.getDescription());
        dto.setBudgetRatio(entity.getBudgetRatio());
        dto.setDeadline(DateTimeUtil.fromLocalToOffset(entity.getDeadline()));
        dto.setStatus(MilestoneStatusDto.valueOf(entity.getStatus().name()));
        dto.setFundStatus(MilestoneFundStatusDto.valueOf(entity.getFundStatus().name()));

        // Only staff, the client and freelancer involved in this project can see internal stuff
        if (authContext.hasInternalAccess(entity.getProject())) {
            dto.setContractualBudget(entity.getContractualBudget());
            dto.setDeliverables(entity.getDeliverables().stream()
                    .map(f -> fileMapper.toDTO(f, DetailLevel.FULL))
                    .toList());
        }

        dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));
        dto.setUpdatedAt(DateTimeUtil.fromLocalToOffset(entity.getUpdatedAt()));

        return dto;
    }
}