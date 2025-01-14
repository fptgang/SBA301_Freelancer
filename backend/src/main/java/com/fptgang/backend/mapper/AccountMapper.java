package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.AccountDto;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Optional;

@Component
public class AccountMapper extends BaseMapper<AccountDto, Account> {

    @Autowired
    private AccountRepos accountRepos;

    @Override
    public Account toEntity(AccountDto dto) {
        if (dto == null) {
            return null;
        }

        Optional<Account> existingAccountOptional = accountRepos.findByAccountId(dto.getAccountId());

        if (existingAccountOptional.isPresent()) {
            Account existingAccount = existingAccountOptional.get();
            existingAccount.setEmail(dto.getEmail() != null ? dto.getEmail() : existingAccount.getEmail());
            existingAccount.setFirstName(dto.getFirstName() != null ? dto.getFirstName() : existingAccount.getFirstName());
            existingAccount.setLastName(dto.getLastName() != null ? dto.getLastName() : existingAccount.getLastName());
            existingAccount.setAvatarUrl(dto.getAvatarUrl() != null ? dto.getAvatarUrl() : existingAccount.getAvatarUrl());
            existingAccount.setBalance(dto.getBalance() != null ? dto.getBalance() : existingAccount.getBalance());
            existingAccount.setRole(dto.getRole() != null ? mapRoleAccount(dto.getRole()) : existingAccount.getRole());
            existingAccount.setVerified(dto.getIsVerified() != null ? dto.getIsVerified() : existingAccount.isVerified());
            existingAccount.setVerifiedAt(dto.getVerifiedAt() != null ? DateTimeUtil.fromOffsetToLocal(dto.getVerifiedAt()) : existingAccount.getVerifiedAt());
            existingAccount.setVisible(dto.getIsVisible() != null ? dto.getIsVisible() : existingAccount.isVisible());

            return existingAccount;
        } else {

            Account entity = new Account();
            entity.setAccountId(dto.getAccountId());
            if (dto.getEmail() != null) {
                entity.setEmail(dto.getEmail());
            }
            if (dto.getFirstName() != null) {
                entity.setFirstName(dto.getFirstName());
            }
            if (dto.getLastName() != null) {
                entity.setLastName(dto.getLastName());
            }
            if (dto.getAvatarUrl() != null) {
                entity.setAvatarUrl(dto.getAvatarUrl());
            }
            if (dto.getBalance() != null) {
                entity.setBalance(dto.getBalance());
            }
            if (dto.getRole() != null) {
                entity.setRole(mapRoleAccount(dto.getRole())); // Enum conversion
            }
            if (dto.getVerifiedAt() != null) {
                entity.setVerifiedAt(DateTimeUtil.fromOffsetToLocal(dto.getVerifiedAt()));
            }
            if (dto.getIsVerified() != null) {
                entity.setVerified(dto.getIsVerified());
            }
            if (dto.getIsVisible() != null) {
                entity.setVisible(dto.getIsVisible());
            }


            return entity;
        }

    }

    @Override
    public AccountDto toDTO(Account entity) {
        if (entity == null) {
            return null;
        }

        AccountDto dto = new AccountDto();
        // Set nullable and non-nullable fields
        dto.setAccountId(entity.getAccountId());
        dto.setEmail(entity.getEmail());
        dto.setFirstName(entity.getFirstName());
        dto.setLastName(entity.getLastName());
        dto.setPassword(entity.getPassword());
        dto.setRole(mapRoleAccountDto(entity.getRole()));
        dto.setIsVerified(entity.isVerified());
        dto.setIsVisible(entity.isVisible());
        // Nullable fields
        dto.setAvatarUrl(entity.getAvatarUrl());
        dto.setBalance(entity.getBalance());
        dto.setVerifiedAt(DateTimeUtil.fromLocalToOffset(entity.getVerifiedAt()));
        dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));
        dto.setUpdatedAt(DateTimeUtil.fromLocalToOffset(entity.getUpdatedAt()));

        return dto;
    }

    public Role mapRoleAccount(AccountDto.RoleEnum roleEnum) {
        if (roleEnum == null) {
            return null; // Or a default Role, e.g., Role.CLIENT
        }

        switch (roleEnum) {
            case ADMIN:
                return Role.ADMIN;
            case STAFF:
                return Role.STAFF;
            case CLIENT:
                return Role.CLIENT;
            case FREELANCER:
                return Role.FREELANCER;
            default:
                throw new IllegalArgumentException("Unknown RoleEnum: " + roleEnum);
        }
    }

    public AccountDto.RoleEnum mapRoleAccountDto(Role roleEnum) {
        if (roleEnum == null) {
            return null; // Or a default Role, e.g., Role.CLIENT
        }
        switch (roleEnum) {
            case ADMIN:
                return AccountDto.RoleEnum.ADMIN;
            case STAFF:
                return AccountDto.RoleEnum.STAFF;
            case CLIENT:
                return AccountDto.RoleEnum.CLIENT;
            case FREELANCER:
                return AccountDto.RoleEnum.FREELANCER;
            default:
                throw new IllegalArgumentException("Unknown RoleEnum: " + roleEnum);
        }
    }

}