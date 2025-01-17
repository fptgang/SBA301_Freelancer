package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProjectSkillDto;
import com.fptgang.backend.model.Proficiency;
import com.fptgang.backend.model.ProjectSkill;
import com.fptgang.backend.model.Skill;
import com.fptgang.backend.repository.ProjectSkillRepos;
import com.fptgang.backend.repository.SkillRepos;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class ProjectSkillMapper extends BaseMapper<ProjectSkillDto, ProjectSkill> {
    @Autowired
    private SkillMapper skillMapper;
    @Autowired
    private SkillRepos skillRepos;
    @Autowired
    private ProjectSkillRepos projectSkillRepos;

    

    @Override
    public ProjectSkillDto toDTO(ProjectSkill entity) {
        if (entity == null) {
            return null;
        }

        ProjectSkillDto dto = new ProjectSkillDto();

        dto.setProjectSkillId(entity.getProjectSkillId());
        dto.setSkill(skillMapper.toDTO(entity.getSkill()));
        dto.setProficiency(ProjectSkillDto.ProficiencyEnum.valueOf(entity.getProficiency().name()));

        return dto;
    }

    @Override
    public ProjectSkill toEntity(ProjectSkillDto dto) {
        if (dto == null) {
            return null;
        }

        Optional<ProjectSkill> existingEntityOptional = projectSkillRepos.findById(dto.getProjectSkillId());
        if (existingEntityOptional.isPresent()) {
            ProjectSkill existEntity = existingEntityOptional.get();

            if (dto.getSkill() != null) {
                existEntity.setSkill(findSkill(dto.getSkill().getSkillId()));
            }

            if (dto.getProficiency() != null) {
                existEntity.setProficiency(Proficiency.valueOf(dto.getProficiency().name()));
            }

            return existEntity;
        } else {
            ProjectSkill entity = new ProjectSkill();

            entity.setProjectSkillId(dto.getProjectSkillId());
            if (dto.getSkill() != null) {
                entity.setSkill(findSkill(dto.getSkill().getSkillId()));
            }
            if (dto.getProficiency() != null) {
                entity.setProficiency(Proficiency.valueOf(dto.getProficiency().name()));
            }

            return entity;
        }
    }

    public Skill findSkill(Long id) {
        return skillRepos.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Skill does not exist"));
    }
}
