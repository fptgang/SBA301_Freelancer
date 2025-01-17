package com.fptgang.backend.service;

import com.fptgang.backend.model.Role;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.oauth2.jwt.Jwt;

import javax.annotation.Nullable;

public interface JwtService {
    @NotNull
    Jwt generateJwt(String email, Role role);

    String createJwtFromRefreshToken(String token);

    @NotNull
    String generateToken(String email, Role role);

    @Nullable
    Jwt parseToken(String token);
}
