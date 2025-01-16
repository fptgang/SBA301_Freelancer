package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProjectSkillDto;
import com.fptgang.backend.model.ProjectSkill;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ProjectSkillMapper extends BaseMapper<ProjectSkillDto, ProjectSkill> {
    @Autowired
    private SkillMapper skillMapper;

    @Override
    ProjectSkillDto toDTO(ProjectSkill entity) {
        return null;
    }

    @Override
    ProjectSkill toEntity(ProjectSkillDto dto) {
        return null;
    }
}
