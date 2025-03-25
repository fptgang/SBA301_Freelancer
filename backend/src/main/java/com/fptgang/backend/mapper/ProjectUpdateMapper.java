package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProjectUpdateDto;
import com.fptgang.backend.model.Proficiency;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.model.ProjectSkill;
import com.fptgang.backend.repository.ProjectCategoryRepos;
import com.fptgang.backend.repository.SkillRepos;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class ProjectUpdateMapper extends BaseMapper<ProjectUpdateDto, Project> {
    private final ProjectCategoryRepos projectCategoryRepos;
    private final SkillRepos skillRepos;
    private final MilestoneUpdateMapper milestoneMapper;

    public ProjectUpdateMapper(ProjectCategoryRepos projectCategoryRepos,
                               SkillRepos skillRepos,
                               MilestoneUpdateMapper milestoneMapper) {
        this.projectCategoryRepos = projectCategoryRepos;
        this.skillRepos = skillRepos;
        this.milestoneMapper = milestoneMapper;
    }

    @Override
    public Project toEntity(ProjectUpdateDto dto) {
        return Project.builder()
                .category(dto.getProjectCategoryId() == null ? null :
                        projectCategoryRepos.getReferenceById(dto.getProjectCategoryId()))
                .title(dto.getTitle())
                .description(dto.getDescription())
                .startDate(DateTimeUtil.fromOffsetToLocal(dto.getStartDate()))
                .maxBudget(dto.getMaxBudget())
                .minBudget(dto.getMinBudget())
                .requiredSkills(dto.getRequiredSkills().stream()
                        .filter(e -> e.getSkillId() != null && e.getProficiency() != null)
                        .map(e -> {
                            return ProjectSkill.builder()
                                    .skill(skillRepos.getReferenceById(e.getSkillId()))
                                    .proficiency(Proficiency.valueOf(e.getProficiency().name()))
                                    .build();
                        }).collect(Collectors.toList()))
                .milestones(dto.getMilestones().stream().map(milestoneMapper::toEntity).collect(Collectors.toList()))
                .build();
    }

    @Override
    public ProjectUpdateDto toDTO(Project entity, DetailLevel level) {
        throw new UnsupportedOperationException();
    }
}
