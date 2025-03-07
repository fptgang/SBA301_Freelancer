package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProficiencyEnum;
import com.fptgang.backend.api.model.ProjectSkillDto;
import com.fptgang.backend.model.Proficiency;
import com.fptgang.backend.model.ProjectSkill;
import com.fptgang.backend.repository.ProjectSkillRepos;
import com.fptgang.backend.repository.SkillRepos;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@Component
public class ProjectSkillMapper extends BaseMapper<ProjectSkillDto, ProjectSkill> {
    private final SkillMapper skillMapper;
    private final SkillRepos skillRepos;
    private final ProjectSkillRepos projectSkillRepos;

    public ProjectSkillMapper(SkillMapper skillMapper, SkillRepos skillRepos, ProjectSkillRepos projectSkillRepos) {
        this.skillMapper = skillMapper;
        this.skillRepos = skillRepos;
        this.projectSkillRepos = projectSkillRepos;
    }

    @Override
    public ProjectSkill toEntity(ProjectSkillDto dto) {
        if (dto == null) {
            return null;
        }

        ProjectSkill entity = new ProjectSkill();
        entity.setProjectSkillId(dto.getProjectSkillId());

        if (dto.getSkill() != null) {
            entity.setSkill(skillRepos.findById(dto.getSkill().getSkillId())
                    .orElseThrow(() -> new IllegalArgumentException("Skill not found")));
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
        dto.setSkill(skillMapper.toDTO(entity.getSkill(), DetailLevel.REFERENCE));
        dto.setProficiency(ProficiencyEnum.valueOf(entity.getProficiency().name()));

        if (level == DetailLevel.REFERENCE) {
            return dto; // those fields are enough
        }

        if (level == DetailLevel.SUMMARY) {
            return dto; // those fields are enough
        }

        // Add more fields if needed for other detail levels

        return dto;
    }
}