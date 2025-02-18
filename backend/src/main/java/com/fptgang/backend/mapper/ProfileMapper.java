package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.AccountResponseDto;
import com.fptgang.backend.api.model.ProfileDto;
import com.fptgang.backend.model.Profile;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.ProfileRepos;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class ProfileMapper extends BaseMapper<ProfileDto, Profile> {
    @Autowired
    private ProfileSkillMapper profileSkillMapper;

    @Autowired
    private ProfileRepos profileRepos;

    @Autowired
    private AccountRepos accountRepos;
    @Autowired
    private AccountMapper accountMapper;

    @Override
    public ProfileDto toDTO(Profile entity) {
        if (entity == null) {
            return null;
        }

        ProfileDto dto = new ProfileDto();
        AccountResponseDto account = new AccountResponseDto();
        account.setAccountId(entity.getAccount().getAccountId());
        account.email(entity.getAccount().getEmail());
        account.setFirstName(entity.getAccount().getFirstName());
        account.setLastName(entity.getAccount().getLastName());
        account.setAvatarUrl(entity.getAccount().getAvatarUrl());
        account.setIsVerified(entity.getAccount().isVerified());
        account.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getAccount().getCreatedAt()));
        dto.setProfileId(entity.getProfileId());
        dto.setAccount(account);
        dto.setOverview(entity.getOverview());
        dto.setEducation(entity.getEducation());
        dto.setPhoneNumber(entity.getPhoneNumber());
        dto.setLanguage(entity.getLanguage());
        dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));
        dto.setUpdatedAt(DateTimeUtil.fromLocalToOffset(entity.getUpdatedAt()));
        dto.setSkills(entity.getSkills().stream()
                .map(profileSkillMapper::toDTO)
                .collect(Collectors.toList()));

        return dto;
    }

    @Override
    public Profile toEntity(ProfileDto dto) {
        if (dto == null) {
            return null;
        }

        Optional<Profile> existingEntityOptional = profileRepos.findById(dto.getProfileId() == null ? 0 : dto.getProfileId());
        if (existingEntityOptional.isPresent() && dto.getProfileId() != null) {
            Profile existingEntity = existingEntityOptional.get();

            existingEntity.setOverview(dto.getOverview() != null ? dto.getOverview() : existingEntity.getOverview());
            existingEntity.setEducation(dto.getEducation() != null ? dto.getEducation() : existingEntity.getEducation());
            existingEntity.setPhoneNumber(dto.getPhoneNumber() != null ? dto.getPhoneNumber() : existingEntity.getPhoneNumber());
            existingEntity.setLanguage(dto.getLanguage() != null ? dto.getLanguage() : existingEntity.getLanguage());

            if (dto.getSkills() != null) {
                existingEntity.setSkills(dto.getSkills().stream()
                        .map(profileSkillMapper::toEntity)
                        .collect(Collectors.toList()));
            }

            return existingEntity;
        } else {
            Profile entity = new Profile();
            entity.setAccount(accountRepos.findByAccountId(dto.getAccount().getAccountId())
                    .orElseThrow(() -> new IllegalArgumentException("Account does not exist")));

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
    }
}
