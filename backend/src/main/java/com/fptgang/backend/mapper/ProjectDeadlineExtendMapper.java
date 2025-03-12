package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProjectDeadlineExtendDto;
import com.fptgang.backend.model.Milestone;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
public class ProjectDeadlineExtendMapper extends BaseMapper<ProjectDeadlineExtendDto, List<Milestone>> {
    private final ProjectRepos projectRepos;

    public ProjectDeadlineExtendMapper(ProjectRepos projectRepos) {
        this.projectRepos = projectRepos;
    }

    @Override
    public List<Milestone> toEntity(ProjectDeadlineExtendDto dto) {
        return dto.getMilestones().stream().map(e -> {
            Milestone milestone = new Milestone();
            milestone.setMilestoneId(e.getMilestoneId());
            milestone.setProject(projectRepos.getReferenceById(Objects.requireNonNull(dto.getProjectId())));
            milestone.setDeadline(DateTimeUtil.fromOffsetToLocal(e.getNewDeadline()));
            return milestone;
        }).toList();
    }

    @Override
    public ProjectDeadlineExtendDto toDTO(List<Milestone> entity, DetailLevel level) {
        throw new UnsupportedOperationException();
    }
}
