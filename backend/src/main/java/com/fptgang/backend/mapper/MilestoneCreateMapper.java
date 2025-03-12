package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.MilestoneCreateDto;
import com.fptgang.backend.model.Milestone;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.stereotype.Component;

@Component
public class MilestoneCreateMapper extends BaseMapper<MilestoneCreateDto, Milestone> {
    private final ProjectRepos projectRepos;

    public MilestoneCreateMapper(ProjectRepos projectRepos) {
        this.projectRepos = projectRepos;
    }

    @Override
    public Milestone toEntity(MilestoneCreateDto dto) {
        return Milestone.builder()
                .project(dto.getProjectId() == null ? null : projectRepos.getReferenceById(dto.getProjectId()))
                .title(dto.getTitle())
                .description(dto.getDescription())
                .deadline(DateTimeUtil.fromOffsetToLocal(dto.getDeadline()))
                .budgetRatio(dto.getBudgetRatio())
                .build();
    }

    @Override
    public MilestoneCreateDto toDTO(Milestone entity, DetailLevel level) {
        throw new UnsupportedOperationException();
    }
}
