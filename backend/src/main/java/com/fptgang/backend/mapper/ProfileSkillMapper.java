package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProfileSkillDto;
import com.fptgang.backend.model.Proficiency;
import com.fptgang.backend.model.ProfileSkill;
import com.fptgang.backend.model.Skill;
import com.fptgang.backend.repository.ProfileSkillRepos;
import com.fptgang.backend.repository.SkillRepos;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class ProfileSkillMapper extends BaseMapper<ProfileSkillDto, ProfileSkill> {
    @Autowired
    private SkillMapper skillMapper;
    @Autowired
    private SkillRepos skillRepos;

    @Autowired
    private ProfileSkillRepos profileSkillRepos;

    @Override
    public ProfileSkillDto toDTO(ProfileSkill entity) {
        if (entity == null) {
            return null;
        }

        ProfileSkillDto dto = new ProfileSkillDto();

        dto.setProfileSkillId(entity.getProfileSkillId());
        dto.setSkill(skillMapper.toDTO(entity.getSkill()));
        dto.setProficiency(ProfileSkillDto.ProficiencyEnum.valueOf(entity.getProficiency().name()));

        return dto;
    }

    @Override
    public ProfileSkill toEntity(ProfileSkillDto dto) {
        if (dto == null) {
            return null;
        }

        Optional<ProfileSkill> existingEntityOptional = profileSkillRepos.findById(dto.getProfileSkillId());
        if (existingEntityOptional.isPresent()) {
            ProfileSkill existEntity = existingEntityOptional.get();

            if (dto.getSkill() != null) {
                existEntity.setSkill(findSkill(dto.getSkill().getSkillId()));
            }

            if (dto.getProficiency() != null) {
                existEntity.setProficiency(Proficiency.valueOf(dto.getProficiency().name()));
            }

            return existEntity;
        } else {
            ProfileSkill entity = new ProfileSkill();

            entity.setProfileSkillId(dto.getProfileSkillId());
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