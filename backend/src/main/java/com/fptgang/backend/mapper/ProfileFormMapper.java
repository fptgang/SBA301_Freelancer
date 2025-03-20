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
    private final SkillRepos skillRepos;

    public ProfileFormMapper(SkillRepos skillRepos) {
        this.skillRepos = skillRepos;
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
                    .filter(e -> e.getSkillId() != null && e.getProficiency() != null)
                    .map(e -> {
                        return ProfileSkill.builder()
                                .skill(skillRepos.getReferenceById(e.getSkillId()))
                                .proficiency(Proficiency.valueOf(e.getProficiency().name()))
                                .build();
                    }).collect(Collectors.toList()));
        }

        return entity;
    }

    @Override
    public ProfileFormDto toDTO(Profile entity, DetailLevel level) {
        throw new UnsupportedOperationException();
    }
}