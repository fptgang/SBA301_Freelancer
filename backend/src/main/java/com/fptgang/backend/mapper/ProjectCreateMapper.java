package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProjectCreateDto;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.model.ProjectSkill;
import com.fptgang.backend.repository.ProjectCategoryRepos;
import com.fptgang.backend.repository.SkillRepos;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
public class ProjectCreateMapper extends BaseMapper<ProjectCreateDto, Project> {
    private final ProjectCategoryRepos projectCategoryRepos;
    private final SkillRepos skillRepos;
    private final MilestoneCreateMapper milestoneMapper;

    public ProjectCreateMapper(ProjectCategoryRepos projectCategoryRepos,
                               SkillRepos skillRepos,
                               MilestoneCreateMapper milestoneMapper) {
        this.projectCategoryRepos = projectCategoryRepos;
        this.skillRepos = skillRepos;
        this.milestoneMapper = milestoneMapper;
    }

    @Override
    public Project toEntity(ProjectCreateDto dto) {
        return Project.builder()
                .category(projectCategoryRepos.getReferenceById(Objects.requireNonNull(dto.getProjectCategoryId())))
                .title(dto.getTitle())
                .description(dto.getDescription())
                .startDate(DateTimeUtil.fromOffsetToLocal(dto.getStartDate()))
                .maxBudget(dto.getMaxBudget())
                .minBudget(dto.getMinBudget())
                .requiredSkills(dto.getRequiredSkillIds().stream().map(e -> {
                    return ProjectSkill.builder().skill(skillRepos.getReferenceById(e)).build();
                }).toList())
                .milestones(dto.getMilestones().stream().map(milestoneMapper::toEntity).toList())
                .build();
    }

    @Override
    public ProjectCreateDto toDTO(Project entity, DetailLevel level) {
        throw new UnsupportedOperationException();
    }
}
