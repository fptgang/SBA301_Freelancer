package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.AccountDto;
import com.fptgang.model.Account;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Component
public class AccountMapper extends BaseMapper<AccountDto, Account> {

    @Override
    public Account toEntity(AccountDto dto) {
        if (dto == null) {
            return null;
        }

        Account entity = new Account();
        if (dto.getAccountId() != null) {
            entity.setAccountId(dto.getAccountId());
        }
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

        // Convert createdAt and updatedAt to OffsetDateTime if not null
        if (dto.getCreatedAt() != null) {
            entity.setCreatedAt(dto.getCreatedAt());
        }
        if (dto.getUpdatedAt() != null) {
            entity.setUpdatedAt(dto.getUpdatedAt());
        }


        return entity;
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
        // Nullable fields
        dto.setAvatarUrl(entity.getAvatarUrl() != null ? entity.getAvatarUrl() : null);
        dto.setBalance(entity.getBalance() != null ? entity.getBalance() : BigDecimal.ZERO);

        // Nullable timestamps
        if (entity.getVerifiedAt() != null) {
            dto.setVerifiedAt(OffsetDateTime.from(entity.getVerifiedAt()));
        } else {
            dto.setVerifiedAt(null);
        }

        if (entity.getCreatedAt() != null) {
            dto.setCreatedAt(OffsetDateTime.from(entity.getCreatedAt()));
        }

        if (entity.getUpdatedAt() != null) {
            dto.setUpdatedAt(OffsetDateTime.from(entity.getUpdatedAt()));
        }

        return dto;
    }

    private Account.RoleEnum mapRoleAccount(AccountDto.RoleEnum roleEnum) {
        if (roleEnum == null) {
            return null; // Or a default Role, e.g., Role.CLIENT
        }

        switch (roleEnum) {
            case ADMIN:
                return Account.RoleEnum.ADMIN;
            case STAFF:
                return Account.RoleEnum.STAFF;
            case CLIENT:
                return Account.RoleEnum.CLIENT;
            case FREELANCER:
                return Account.RoleEnum.FREELANCER;
            default:
                throw new IllegalArgumentException("Unknown RoleEnum: " + roleEnum);
        }
    }

    private AccountDto.RoleEnum mapRoleAccountDto(Account.RoleEnum roleEnum) {
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