package com.fptgang.backend.service;

import com.fptgang.backend.api.model.AuthResponseDto;
import com.fptgang.backend.api.model.ForgotPasswordRequestDto;
import com.fptgang.backend.api.model.RegisterRequestDto;
import com.fptgang.backend.api.model.ResetPasswordRequestDto;
import com.fptgang.backend.util.Fingerprint;

public interface AuthService {

    AuthResponseDto login(String email, String password, Fingerprint fingerprint);

    AuthResponseDto loginWithGoogle(String token, Fingerprint fingerprint);

    boolean register(RegisterRequestDto registerRequestDTO);

    boolean logout(String email, Fingerprint fingerprint);

    void forgotPassword(ForgotPasswordRequestDto email);

    void resetPassword(ResetPasswordRequestDto request);
}
