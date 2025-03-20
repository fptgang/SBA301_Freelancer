package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProfileFormDto;
import com.fptgang.backend.model.Proficiency;
import com.fptgang.backend.model.Profile;
import com.fptgang.backend.model.ProfileSkill;
import com.fptgang.backend.repository.SkillRepos;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Slf4j
@Component
public class ProfileFormMapper extends BaseMapper<ProfileFormDto, Profile> {
    private final ProfileSkillMapper profileSkillMapper;

    public ProfileFormMapper(ProfileSkillMapper profileSkillMapper) {
        this.profileSkillMapper = profileSkillMapper;
    }

    @Override
    public Profile toEntity(ProfileFormDto dto) {
        Profile entity = new Profile();

        entity.setOverview(dto.getOverview());
        entity.setEducation(dto.getEducation());
        entity.setPhoneNumber(dto.getPhoneNumber());
        entity.setLanguage(dto.getLanguage());
        if (dto.getSkills() != null) {
            entity.setSkills(dto.getSkills().stream()
                    .map(profileSkillMapper::toEntity)
                    .collect(Collectors.toList()));
        }

        return entity;
    }

    @Override
    public ProfileFormDto toDTO(Profile entity, DetailLevel level) {
        throw new UnsupportedOperationException();
    }
}