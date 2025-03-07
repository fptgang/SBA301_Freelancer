package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProficiencyEnum;
import com.fptgang.backend.api.model.ProfileSkillDto;
import com.fptgang.backend.model.Proficiency;
import com.fptgang.backend.model.ProfileSkill;
import com.fptgang.backend.model.Skill;
import com.fptgang.backend.repository.ProfileSkillRepos;
import com.fptgang.backend.repository.SkillRepos;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ProfileSkillMapper extends BaseMapper<ProfileSkillDto, ProfileSkill> {
    private final SkillMapper skillMapper;
    private final SkillRepos skillRepos;
    private final ProfileSkillRepos profileSkillRepos;

    public ProfileSkillMapper(SkillMapper skillMapper, SkillRepos skillRepos, ProfileSkillRepos profileSkillRepos) {
        this.skillMapper = skillMapper;
        this.skillRepos = skillRepos;
        this.profileSkillRepos = profileSkillRepos;
    }

    @Override
    public ProfileSkill toEntity(ProfileSkillDto dto) {
        if (dto == null) {
            return null;
        }

        ProfileSkill entity = new ProfileSkill();
        entity.setProfileSkillId(dto.getProfileSkillId());

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
    public ProfileSkillDto toDTO(ProfileSkill entity, DetailLevel level) {
        if (entity == null) {
            return null;
        }

        ProfileSkillDto dto = new ProfileSkillDto();
        dto.setProfileSkillId(entity.getProfileSkillId());
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