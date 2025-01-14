package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.RefreshTokenDto;
import com.fptgang.backend.model.RefreshToken;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class RefreshTokenMapper extends BaseMapper<RefreshTokenDto,RefreshToken> {

    @Autowired
    private AccountRepos accountRepos;

    @Override
    public RefreshTokenDto toDTO(RefreshToken entity) {
        RefreshTokenDto dto = new RefreshTokenDto();
        dto.setRefreshTokenId(entity.getRefreshTokenId());
        dto.setAccountId(entity.getAccount().getAccountId());
        dto.setToken(entity.getToken());
        dto.setExpiryDate(DateTimeUtil.fromInstantToOffset(entity.getExpiryDate()));

        return dto;
    }


    @Override
    public RefreshToken toEntity(RefreshTokenDto dto) {
        if (dto == null) {
            return null;
        }

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setRefreshTokenId(dto.getRefreshTokenId());
        if (dto.getAccountId() != null) {
            refreshToken.setAccount(accountRepos.findByAccountId(dto.getAccountId())
                    .orElseThrow(() -> new IllegalArgumentException("Account does not exist")));
        }
        if (dto.getToken() != null) {
            refreshToken.setToken(dto.getToken());
        }
        if (dto.getExpiryDate() != null) {
            refreshToken.setExpiryDate(dto.getExpiryDate().toInstant());
        }

        return refreshToken;
    }
}
