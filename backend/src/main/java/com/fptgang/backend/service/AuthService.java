package com.fptgang.backend.service;

import com.fptgang.backend.api.model.AuthResponseDto;
import com.fptgang.backend.api.model.ForgotPasswordRequestDto;
import com.fptgang.backend.api.model.RegisterRequestDto;
import com.fptgang.backend.api.model.ResetPasswordRequestDto;
import org.springframework.security.core.Authentication;

public interface AuthService {

    AuthResponseDto login(String email, String password);

    boolean register(RegisterRequestDto registerRequestDTO);

    boolean logout(Authentication authentication);

    Authentication getAuthentication(String email);

    AuthResponseDto loginWithGoogle(String token);

    void forgotPassword(ForgotPasswordRequestDto email);

    void resetPassword(ResetPasswordRequestDto request);
}
