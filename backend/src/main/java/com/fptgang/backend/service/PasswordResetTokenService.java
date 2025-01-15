package com.fptgang.backend.service;

import java.util.Optional;

public interface PasswordResetTokenService {

    String generateToken(String email);
    Optional<String> getEmailFromToken(String token);
    void invalidateToken(String token);
}
