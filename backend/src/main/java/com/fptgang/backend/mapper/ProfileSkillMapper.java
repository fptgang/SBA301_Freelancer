package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProfileSkillDto;
import com.fptgang.backend.model.ProfileSkill;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ProfileSkillMapper extends BaseMapper<ProfileSkillDto, ProfileSkill> {
    @Autowired
    private SkillMapper skillMapper;

    @Override
    ProfileSkillDto toDTO(ProfileSkill entity) {
        return null;
    }

    @Override
    ProfileSkill toEntity(ProfileSkillDto dto) {
        return null;
    }
}
