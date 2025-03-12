package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProficiencyEnum;
import com.fptgang.backend.api.model.ProfileSkillDto;
import com.fptgang.backend.model.Proficiency;
import com.fptgang.backend.model.ProfileSkill;
import com.fptgang.backend.repository.SkillRepos;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ProfileSkillMapper extends BaseMapper<ProfileSkillDto, ProfileSkill> {
    private final SkillMapper skillMapper;
    private final SkillRepos skillRepos;

    public ProfileSkillMapper(SkillMapper skillMapper, SkillRepos skillRepos) {
        this.skillMapper = skillMapper;
        this.skillRepos = skillRepos;
    }

    @Override
    public ProfileSkill toEntity(ProfileSkillDto dto) {
        if (dto == null) {
            return null;
        }

        ProfileSkill entity = new ProfileSkill();
        entity.setProfileSkillId(dto.getProfileSkillId());

        if (dto.getSkill() != null && dto.getSkill().getSkillId() != null) {
            entity.setSkill(skillRepos.getReferenceById(dto.getSkill().getSkillId()));
        }

        if (dto.getProficiency() != null) {
            entity.setProficiency(Proficiency.valueOf(dto.getProficiency().name()));
        }

        return entity;
    }

    @Override
    public ProfileSkillDto toDTO(ProfileSkill entity, DetailLevel level) {
        if (entity == null) {
            return null;
        }

        ProfileSkillDto dto = new ProfileSkillDto();
        dto.setProfileSkillId(entity.getProfileSkillId());
        dto.setSkill(skillMapper.toDTO(entity.getSkill(), DetailLevel.FULL));
        dto.setProficiency(ProficiencyEnum.valueOf(entity.getProficiency().name()));

        return dto;
    }
}