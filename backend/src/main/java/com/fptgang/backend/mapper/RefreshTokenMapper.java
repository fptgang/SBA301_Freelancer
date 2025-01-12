package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.RefreshTokenDto;
import com.fptgang.model.RefreshToken;

public class RefreshTokenMapper extends BaseMapper<RefreshTokenDto,RefreshToken> {
    @Override
    RefreshTokenDto toDTO(RefreshToken entity) {
        RefreshTokenDto dto = new RefreshTokenDto();
        dto.setRefreshTokenId(entity.getRefreshTokenId());
        dto.setAccountId(entity.getAccountId());
        dto.setToken(entity.getToken());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setExpiryDate(entity.getExpiryDate());

        return dto;
    }


    @Override
    RefreshToken toEntity(RefreshTokenDto dto) {
        if (dto == null) {
            return null;
        }

        RefreshToken refreshToken = new RefreshToken();
        if (dto.getRefreshTokenId() != null) {
            refreshToken.setRefreshTokenId(dto.getRefreshTokenId());
        }
        if (dto.getAccountId() != null) {
            refreshToken.setAccountId(dto.getAccountId());
        }
        if (dto.getToken() != null) {
            refreshToken.setToken(dto.getToken());
        }
        if (dto.getCreatedAt() != null) {
            refreshToken.setCreatedAt(dto.getCreatedAt());
        }
        if (dto.getExpiryDate() != null) {
            refreshToken.setExpiryDate(dto.getExpiryDate());
        }

        return refreshToken;
    }
}
