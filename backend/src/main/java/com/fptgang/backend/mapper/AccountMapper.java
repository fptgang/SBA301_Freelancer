package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.AccountDto;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.repository.ProfileRepos;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.stereotype.Component;

@Component
public class AccountMapper extends BaseMapper<AccountDto, Account> {
    private final ProfileRepos profileRepos;
    private final ProfileMapper.Converter profileConverter;

    public AccountMapper(ProfileRepos profileRepos, ProfileMapper.Converter profileConverter) {
        this.profileRepos = profileRepos;
        this.profileConverter = profileConverter;
    }

    @Override
    public Account toEntity(AccountDto dto) {
        if (dto == null) {
            return null;
        }

        Account account = new Account();
        account.setAccountId(dto.getAccountId());
        account.setEmail(dto.getEmail());
        account.setFirstName(dto.getFirstName());
        account.setLastName(dto.getLastName());
        account.setPassword(dto.getPassword());
        account.setAvatarUrl(dto.getAvatarUrl());
        account.setBalance(dto.getBalance());
        account.setRole(dto.getRole() == null ? null : Role.valueOf(dto.getRole().name()));
        account.setIsVerified(dto.getIsVerified());
        account.setIsVisible(dto.getIsVisible());
        account.setVerifiedAt(dto.getVerifiedAt() != null ? DateTimeUtil.fromOffsetToLocal(dto.getVerifiedAt()) : null);
        account.setCreatedAt(dto.getCreatedAt() != null ? DateTimeUtil.fromOffsetToLocal(dto.getCreatedAt()) : null);
        account.setUpdatedAt(dto.getUpdatedAt() != null ? DateTimeUtil.fromOffsetToLocal(dto.getUpdatedAt()) : null);
        if (dto.getProfile() != null && dto.getProfile().getProfileId() != null) {
            account.setProfile(profileRepos.getReferenceById(dto.getProfile().getProfileId()));
        }

        return account;
    }

    @Override
    public AccountDto toDTO(Account entity, DetailLevel level) {
        if (entity == null) {
            return null;
        }

        AccountDto dto = new AccountDto();
        dto.setAccountId(entity.getAccountId());
        dto.setFirstName(entity.getFirstName());
        dto.setLastName(entity.getLastName());
        dto.setAvatarUrl(entity.getAvatarUrl());
        dto.setIsVerified(entity.getIsVerified());
        dto.setIsVisible(entity.getIsVisible());

        if (level == DetailLevel.REFERENCE) {
            return dto; // those fields are enough
        }

        dto.setEmail(entity.getEmail());
        //dto.setPassword(entity.getPassword());
        dto.setBalance(entity.getBalance());
        dto.setRole(entity.getRole() == null ? null : AccountDto.RoleEnum.valueOf(entity.getRole().name()));
        dto.setVerifiedAt(DateTimeUtil.fromLocalToOffset(entity.getVerifiedAt()));
        dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));
        dto.setUpdatedAt(DateTimeUtil.fromLocalToOffset(entity.getUpdatedAt()));
        dto.setProfile(profileConverter.toDTO(entity.getProfile(), DetailLevel.FULL));

        return dto;
    }
}