package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.RefreshTokenDto;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.RefreshToken;
import com.fptgang.backend.repository.AccountRepos;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.Optional;

@Component
public class RefreshTokenMapper extends BaseMapper<RefreshTokenDto,RefreshToken> {

    @Autowired
    private AccountRepos accountRepos;

    @Override
    RefreshTokenDto toDTO(RefreshToken entity) {
        RefreshTokenDto dto = new RefreshTokenDto();
        dto.setRefreshTokenId(entity.getRefreshTokenId());
        dto.setAccountId(entity.getAccount().getAccountId());
        dto.setToken(entity.getToken());
        dto.setExpiryDate(OffsetDateTime.from(entity.getExpiryDate()));

        return dto;
    }


    @Override
    RefreshToken toEntity(RefreshTokenDto dto) {
        if (dto == null) {
            return null;
        }

        Optional<Account> accountOptional = accountRepos.findByAccountId(dto.getAccountId());
        Account account = accountOptional.get();
        RefreshToken refreshToken = new RefreshToken();
        if (dto.getRefreshTokenId() != null) {
            refreshToken.setRefreshTokenId(dto.getRefreshTokenId());
        }
        if (dto.getAccountId() != null) {
            refreshToken.setAccount(account);
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
