package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.RefreshTokenDto;
import com.fptgang.backend.model.RefreshToken;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.util.DateTimeUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class RefreshTokenMapper extends BaseMapper<RefreshTokenDto, RefreshToken> {
    private final AccountRepos accountRepos;

    public RefreshTokenMapper(AccountRepos accountRepos) {
        this.accountRepos = accountRepos;
    }

    @Override
    public RefreshToken toEntity(RefreshTokenDto dto) {
        if (dto == null) {
            return null;
        }

        RefreshToken entity = new RefreshToken();
        entity.setRefreshTokenId(dto.getRefreshTokenId());

        if (dto.getAccountId() != null) {
            entity.setAccount(accountRepos.findByAccountId(dto.getAccountId())
                    .orElseThrow(() -> new IllegalArgumentException("Account not found")));
        }

        entity.setToken(dto.getToken());
        entity.setExpiryDate(dto.getExpiryDate().toInstant());

        return entity;
    }

    @Override
    public RefreshTokenDto toDTO(RefreshToken entity, DetailLevel level) {
        if (entity == null) {
            return null;
        }

        RefreshTokenDto dto = new RefreshTokenDto();
        dto.setRefreshTokenId(entity.getRefreshTokenId());
        dto.setAccountId(entity.getAccount().getAccountId());
        dto.setToken(entity.getToken());
        dto.setExpiryDate(DateTimeUtil.fromInstantToOffset(entity.getExpiryDate()));

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