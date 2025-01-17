package com.fptgang.backend.service.impl;

import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.RefreshToken;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.service.JwtService;
import com.fptgang.backend.service.RefreshTokenService;
import jakarta.validation.constraints.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import javax.annotation.Nullable;
import java.time.Duration;
import java.time.Instant;
import java.util.Objects;

@Service
public class JwtServiceImpl implements JwtService {
    private static final Duration JWT_EXPIRY_DURATION = Duration.ofHours(1);
    private static final Logger LOGGER = LoggerFactory.getLogger(JwtServiceImpl.class);
    private final JwtEncoder encoder;
    private final JwtDecoder decoder;
    private final RefreshTokenService refreshTokenService;

    public JwtServiceImpl(JwtEncoder encoder, JwtDecoder decoder, RefreshTokenService refreshTokenService) {
        this.encoder = encoder;
        this.decoder = decoder;
        this.refreshTokenService = refreshTokenService;
    }

    @Override
    public @NotNull Jwt generateJwt(String email, Role role) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("Backend")
                .issuedAt(now)
                .expiresAt(now.plus(JWT_EXPIRY_DURATION))
                .subject(email)
                .claim("scope", role.name())
                .build();
        return this.encoder.encode(JwtEncoderParameters.from(claims));
    }

    @Override
    public String createJwtFromRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenService.findByToken(token);
        if (refreshToken == null) {
            throw new InvalidInputException("Invalid refresh token");
        }

        Account account = refreshToken.getAccount();
        return generateToken(account.getEmail(), account.getRole());
    }

    @Override
    public @NotNull String generateToken(String email, Role role) {
        return generateJwt(email, role).getTokenValue();
    }

    @Nullable
    @Override
    public Jwt parseToken(String token) {
        try {
            Jwt jwt = decoder.decode(token);
            Instant expiryAt = Objects.requireNonNull(jwt.getExpiresAt());
            return expiryAt.isBefore(Instant.now()) ? null : jwt;
        } catch (JwtException e) {
            return null;
        }
    }
}
