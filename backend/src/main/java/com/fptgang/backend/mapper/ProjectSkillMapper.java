package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProficiencyEnum;
import com.fptgang.backend.api.model.ProjectSkillDto;
import com.fptgang.backend.model.Proficiency;
import com.fptgang.backend.model.ProjectSkill;
import com.fptgang.backend.repository.SkillRepos;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ProjectSkillMapper extends BaseMapper<ProjectSkillDto, ProjectSkill> {
    private final SkillMapper skillMapper;
    private final SkillRepos skillRepos;

    public ProjectSkillMapper(SkillMapper skillMapper, SkillRepos skillRepos) {
        this.skillMapper = skillMapper;
        this.skillRepos = skillRepos;
    }

    @Override
    public ProjectSkill toEntity(ProjectSkillDto dto) {
        if (dto == null) {
            return null;
        }

        ProjectSkill entity = new ProjectSkill();
        entity.setProjectSkillId(dto.getProjectSkillId());

        if (dto.getSkill() != null && dto.getSkill().getSkillId() != null) {
            entity.setSkill(skillRepos.getReferenceById(dto.getSkill().getSkillId()));
        }

        if (dto.getProficiency() != null) {
            entity.setProficiency(Proficiency.valueOf(dto.getProficiency().name()));
        }

        return entity;
    }

    @Override
    public ProjectSkillDto toDTO(ProjectSkill entity, DetailLevel level) {
        if (entity == null) {
            return null;
        }

        ProjectSkillDto dto = new ProjectSkillDto();
        dto.setProjectSkillId(entity.getProjectSkillId());
        dto.setSkill(skillMapper.toDTO(entity.getSkill(), DetailLevel.FULL));
        dto.setProficiency(ProficiencyEnum.valueOf(entity.getProficiency().name()));

        return dto;
    }
}