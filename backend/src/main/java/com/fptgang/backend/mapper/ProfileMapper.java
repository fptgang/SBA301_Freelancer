package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProfileDto;
import com.fptgang.backend.model.Profile;
import com.fptgang.backend.security.AuthContext;
import com.fptgang.backend.util.DateTimeUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Slf4j
@Component
public class ProfileMapper extends BaseMapper<ProfileDto, Profile> {
    private final AccountMapper accountMapper;
    private final Converter delegate;

    public ProfileMapper(AccountMapper accountMapper, Converter delegate) {
        this.accountMapper = accountMapper;
        this.delegate = delegate;
    }

    @Override
    public Profile toEntity(ProfileDto dto) {
        Profile entity = delegate.toEntity(dto);

        if (entity != null) {
            entity.setAccount(accountMapper.toEntity(dto.getAccount()));
        }

        return entity;
    }

    @Override
    public ProfileDto toDTO(Profile entity, DetailLevel level) {
        ProfileDto dto = delegate.toDTO(entity, level);

        if (dto != null) {
            dto.setAccount(accountMapper.toDTO(entity.getAccount(), DetailLevel.REFERENCE));
        }

        return dto;
    }

    @Component
    public static class Converter extends BaseMapper<ProfileDto, Profile> {
        private final ProfileSkillMapper profileSkillMapper;
        private final AuthContext authContext;

        public Converter(ProfileSkillMapper profileSkillMapper, AuthContext authContext) {
            this.profileSkillMapper = profileSkillMapper;
            this.authContext = authContext;
        }

        @Override
        public Profile toEntity(ProfileDto dto) {
            if (dto == null) {
                return null;
            }

            Profile entity = new Profile();
            entity.setProfileId(dto.getProfileId());
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
            dto.setIsVisible(entity.getIsVisible());

            if (level == DetailLevel.REFERENCE) {
                return dto; // those fields are enough
            }

            dto.setOverview(entity.getOverview());
            dto.setEducation(entity.getEducation());
            dto.setPhoneNumber(entity.getPhoneNumber());
            dto.setLanguage(entity.getLanguage());
            dto.setSkills(entity.getSkills().stream()
                    .filter(s -> (s.getSkill() != null && s.getSkill().getIsVisible()) ||
                            authContext.hasInvisibilityBypass())
                    .map((s) -> profileSkillMapper.toDTO(s, DetailLevel.FULL))
                    .collect(Collectors.toList()));
            dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));
            dto.setUpdatedAt(DateTimeUtil.fromLocalToOffset(entity.getUpdatedAt()));

            return dto;
        }
    }
}