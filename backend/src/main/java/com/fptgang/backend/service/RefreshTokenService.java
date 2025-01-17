package com.fptgang.backend.service;

import com.fptgang.backend.model.RefreshToken;
import com.fptgang.backend.util.Fingerprint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import javax.annotation.Nullable;
import java.util.Optional;

public interface RefreshTokenService {
    RefreshToken createRefreshToken(String email, Fingerprint fingerprint);
    @Nullable RefreshToken findByToken(String token);
    Page<RefreshToken> getAllByAccountId(Long accountId, Pageable pageable);
    void revokeRefreshTokenByAccountEmail(String email);
    void revokeRefreshTokenBySessionId(String sessionId);
}
