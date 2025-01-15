package com.fptgang.backend.service;

import com.fptgang.backend.dtos.request.ForgotPasswordRequestDTO;
import com.fptgang.backend.dtos.request.RegisterRequestDTO;
import com.fptgang.backend.dtos.request.ResetPasswordRequestDTO;
import com.fptgang.backend.dtos.response.AuthResponseDTO;
import org.springframework.security.core.Authentication;

public interface AuthService {

    AuthResponseDTO login(String email, String password);

    boolean register(RegisterRequestDTO registerRequestDTO);

    boolean logout(Authentication authentication);

    Authentication getAuthentication(String email);

    AuthResponseDTO loginWithGoogle(String token);

    void forgotPassword(ForgotPasswordRequestDTO email);

    void resetPassword(ResetPasswordRequestDTO request);
}
