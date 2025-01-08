package com.fptgang.backend.service;

import com.fptgang.backend.model.RefreshToken;

import java.util.Optional;

public interface RefreshTokenService {

    RefreshToken createRefreshToken(String email);

    RefreshToken findByAccountId(Long accountId);
    Optional<RefreshToken> findByToken(String token);



    RefreshToken verifyExpiration(RefreshToken refreshToken);
}
