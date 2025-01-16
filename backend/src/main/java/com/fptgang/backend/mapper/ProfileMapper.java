package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProfileDto;
import com.fptgang.backend.model.Profile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ProfileMapper extends BaseMapper<ProfileDto, Profile> {
    @Autowired
    private ProfileSkillMapper profileSkillMapper;

    @Override
    ProfileDto toDTO(Profile entity) {
        return null;
    }

    @Override
    Profile toEntity(ProfileDto dto) {
        return null;
    }
}
