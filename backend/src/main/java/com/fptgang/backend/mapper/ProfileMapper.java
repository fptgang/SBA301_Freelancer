package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProfileDto;
import com.fptgang.backend.model.Profile;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.ProfileRepos;
import com.fptgang.backend.util.DateTimeUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Slf4j
@Component
public class ProfileMapper extends BaseMapper<ProfileDto, Profile> {
    private final ProfileRepos profileRepos;
    private final AccountRepos accountRepos;
    private final ProfileSkillMapper profileSkillMapper;
    private final AccountMapper accountMapper;

    public ProfileMapper(ProfileRepos profileRepos, AccountRepos accountRepos, ProfileSkillMapper profileSkillMapper, AccountMapper accountMapper) {
        this.profileRepos = profileRepos;
        this.accountRepos = accountRepos;
        this.profileSkillMapper = profileSkillMapper;
        this.accountMapper = accountMapper;
    }

    @Override
    public Profile toEntity(ProfileDto dto) {
        if (dto == null) {
            return null;
        }

        Profile entity = new Profile();
        entity.setProfileId(dto.getProfileId());

        if (dto.getAccount() != null) {
            entity.setAccount(accountRepos.findByAccountId(dto.getAccount().getAccountId())
                    .orElseThrow(() -> new IllegalArgumentException("Account not found")));
        }

        entity.setOverview(dto.getOverview());
        entity.setEducation(dto.getEducation());
        entity.setPhoneNumber(dto.getPhoneNumber());
        entity.setLanguage(dto.getLanguage());

        if (dto.getSkills() != null) {
            entity.setSkills(dto.getSkills().stream()
                    .map(profileSkillMapper::toEntity)
                    .collect(Collectors.toList()));
        }

        entity.setCreatedAt(DateTimeUtil.fromOffsetToLocal(dto.getCreatedAt()));
        entity.setUpdatedAt(DateTimeUtil.fromOffsetToLocal(dto.getUpdatedAt()));

        return entity;
    }

    @Override
    public ProfileDto toDTO(Profile entity, DetailLevel level) {
        if (entity == null) {
            return null;
        }

        ProfileDto dto = new ProfileDto();
        dto.setProfileId(entity.getProfileId());

        if (entity.getAccount() != null) {
            dto.setAccount(accountMapper.toResponseDto(
                    accountMapper.toDTO(entity.getAccount(), DetailLevel.REFERENCE)));
        }

        dto.setOverview(entity.getOverview());
        dto.setEducation(entity.getEducation());
        dto.setPhoneNumber(entity.getPhoneNumber());
        dto.setLanguage(entity.getLanguage());
        dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));
        dto.setUpdatedAt(DateTimeUtil.fromLocalToOffset(entity.getUpdatedAt()));

        if (level == DetailLevel.REFERENCE) {
            return dto; // those fields are enough
        }

        if (level == DetailLevel.SUMMARY) {
            return dto; // those fields are enough
        }

        dto.setSkills(entity.getSkills().stream()
                .map((s)-> profileSkillMapper.toDTO(s, DetailLevel.REFERENCE))
                .collect(Collectors.toList()));

        // Add more fields if needed for other detail levels

        return dto;
    }
}