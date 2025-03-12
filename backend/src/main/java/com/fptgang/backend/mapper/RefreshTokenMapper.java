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

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setRefreshTokenId(dto.getRefreshTokenId());
        if (dto.getAccountId() != null) {
            refreshToken.setAccount(accountRepos.getReferenceById(dto.getAccountId()));
        }
        refreshToken.setToken(dto.getToken());
        refreshToken.setIpAddress(dto.getIpAddress());
        refreshToken.setSessionId(dto.getSessionId());
        refreshToken.setClientInfo(dto.getClientInfo());
        if (dto.getExpiryDate() != null) {
            refreshToken.setExpiryDate(dto.getExpiryDate().toInstant());
        }

        return refreshToken;
    }

    @Override
    public RefreshTokenDto toDTO(RefreshToken entity, DetailLevel level) {
        RefreshTokenDto dto = new RefreshTokenDto();
        dto.setRefreshTokenId(entity.getRefreshTokenId());
        dto.setAccountId(entity.getAccount().getAccountId());
        dto.setToken(entity.getToken());
        dto.setIpAddress(entity.getIpAddress());
        dto.setSessionId(entity.getSessionId());
        dto.setClientInfo(entity.getClientInfo());
        dto.setExpiryDate(DateTimeUtil.fromInstantToOffset(entity.getExpiryDate()));
        return dto;
    }
}