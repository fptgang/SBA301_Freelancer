package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.SkillDto;
import com.fptgang.backend.model.Skill;
import com.fptgang.backend.repository.SkillRepos;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class SkillMapper extends BaseMapper<SkillDto, Skill> {
    @Autowired
    private SkillRepos skillRepos;

    @Override
    SkillDto toDTO(Skill entity) {
        if (entity == null) {
            return null;
        }
        SkillDto dto = new SkillDto();
        dto.setSkillId(entity.getSkillId());
        dto.setName(entity.getName());
        dto.setIsVisible(entity.isVisible());
        dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));
        dto.setUpdatedAt(DateTimeUtil.fromLocalToOffset(entity.getUpdatedAt()));
        return dto;
    }

    @Override
    Skill toEntity(SkillDto dto) {
        if (dto == null) {
            return null;
        }

        Skill skill = skillRepos.findBySkillId(dto.getSkillId())
                .orElseGet(() -> Skill.builder().skillId(dto.getSkillId()).build());

        if (dto.getName() != null) {
            skill.setName(dto.getName());
        }

        if (dto.getIsVisible() != null) {
            skill.setVisible(dto.getIsVisible());
        }

        return null;
    }
}
