package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.SkillDto;
import com.fptgang.backend.model.Skill;
import com.fptgang.backend.repository.SkillRepos;
import com.fptgang.backend.util.DateTimeUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class SkillMapper extends BaseMapper<SkillDto, Skill> {
    private final SkillRepos skillRepos;

    public SkillMapper(SkillRepos skillRepos) {
        this.skillRepos = skillRepos;
    }

    @Override
    public Skill toEntity(SkillDto dto) {
        if (dto == null) {
            return null;
        }

        Skill entity = new Skill();
        entity.setSkillId(dto.getSkillId());
        entity.setName(dto.getName());
        entity.setIsVisible(dto.getIsVisible());
        entity.setCreatedAt(DateTimeUtil.fromOffsetToLocal(dto.getCreatedAt()));
        entity.setUpdatedAt(DateTimeUtil.fromOffsetToLocal(dto.getUpdatedAt()));

        return entity;
    }

    @Override
    public SkillDto toDTO(Skill entity, DetailLevel level) {
        if (entity == null) {
            return null;
        }

        SkillDto dto = new SkillDto();
        dto.setSkillId(entity.getSkillId());
        dto.setName(entity.getName());
        dto.setIsVisible(entity.getIsVisible());
        dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));
        dto.setUpdatedAt(DateTimeUtil.fromLocalToOffset(entity.getUpdatedAt()));

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