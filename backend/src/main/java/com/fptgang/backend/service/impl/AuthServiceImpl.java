package com.fptgang.backend.service.impl;

import com.fptgang.backend.api.model.AuthResponseDto;
import com.fptgang.backend.api.model.ForgotPasswordRequestDto;
import com.fptgang.backend.api.model.RegisterRequestDto;
import com.fptgang.backend.api.model.ResetPasswordRequestDto;
import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.mapper.AccountMapper;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.RefreshToken;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.security.PasswordEncoderConfig;
import com.fptgang.backend.service.*;
import com.fptgang.backend.util.Fingerprint;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final AccountRepos accountRepos;
    private final JwtService tokenService;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoderConfig passwordEncoderConfig;
    private final EmailService emailService;
    private final PasswordResetTokenService passwordResetTokenService;
    private final AccountMapper accountMapper;

    public AuthServiceImpl(AccountRepos accountRepos,
                           JwtService tokenService,
                           RefreshTokenService refreshTokenService,
                           PasswordEncoderConfig passwordEncoderConfig,
                           EmailService emailService,
                           PasswordResetTokenService passwordResetTokenService,
                           AccountMapper accountMapper) {
        this.accountRepos = accountRepos;
        this.tokenService = tokenService;
        this.refreshTokenService = refreshTokenService;
        this.passwordEncoderConfig = passwordEncoderConfig;
        this.emailService = emailService;
        this.passwordResetTokenService = passwordResetTokenService;
        this.accountMapper = accountMapper;
    }

    @Override
    public AuthResponseDto login(String email, String password, Fingerprint fingerprint) {
        Account account = accountRepos.findByEmail(email)
                .orElseThrow(() -> new InvalidInputException("User not found"));

        if (passwordEncoderConfig.bcryptEncoder().matches(password, account.getPassword())) {
            Result result = authenticate(account, fingerprint);
            log.info("User {} logged using Email-Password: token = {}", email, result.jwt);
            return result.dto;
        } else {
            throw new InvalidInputException("Password is incorrect");
        }
    }

    @Override
    public AuthResponseDto loginWithGoogle(String token, Fingerprint fingerprint) {
        HttpTransport httpTransport = new NetHttpTransport();
        JsonFactory jsonFactory = new GsonFactory();
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier(httpTransport, jsonFactory);

        try {
            GoogleIdToken idToken = verifier.verify(token);
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String googleAccountId = payload.get("id").toString();
            String firstName = payload.get("given_name").toString();
            String lastName = payload.get("family_name").toString();
            String picture = payload.get("picture").toString();

            Account account = accountRepos.findByEmail(email).orElseGet(() -> {
                log.info("User {} registered using Google account {}", email, googleAccountId);
                log.info("User {} is verified using Google account {}", email, googleAccountId);

                return accountRepos.saveAndFlush(
                        Account.builder()
                                .email(email)
                                .firstName(firstName)
                                .lastName(lastName)
                                .avatarUrl(picture)
                                .role(Role.CLIENT)  // TODO CHANGE THIS
                                .isVerified(true)
                                .verifiedAt(LocalDateTime.now())
                                .build()
                );
            });

            Result result = authenticate(account, fingerprint);
            log.info("User {} logged using Google account {}: token = {}", email, googleAccountId, result.jwt);

            return result.dto;
        } catch (GeneralSecurityException | IOException e) {
            log.error("Error Google login {}", e.getMessage());
        }
        return null;
    }

    @Override
    public boolean register(RegisterRequestDto dto) {
        if (accountRepos.findByEmail(dto.getEmail()).isEmpty()) {
            if (dto.getPassword().equals(dto.getConfirmPassword())) {
                String hashPass = passwordEncoderConfig.bcryptEncoder().encode(dto.getPassword());
                accountRepos.save(
                        Account.builder()
                                .email(dto.getEmail())
                                .firstName(dto.getFirstName())
                                .lastName(dto.getLastName())
                                .role(Role.CLIENT)  // TODO CHANGE THIS
                                .password(hashPass)
                                .build());
                log.info("User {} registered using Email-Password", dto.getEmail());
                return true;
            } else {
                throw new InvalidInputException("Password and Confirm Password do not match");
            }
        } else {
            throw new InvalidInputException("Email already exists");
        }
    }

    @Override
    public boolean logout(String email, Fingerprint fingerprint) {
        // Prefer revoking by sessionId unless it is not provided
        if (fingerprint == null || fingerprint.getSessionId() == null) {
            refreshTokenService.revokeRefreshTokenByAccountEmail(email);
        } else {
            refreshTokenService.revokeRefreshTokenBySessionId(fingerprint.getSessionId());
        }
        SecurityContextHolder.getContext().setAuthentication(null);
        return true;
    }

    @Override
    public void forgotPassword(ForgotPasswordRequestDto dto) {
        Account account = accountRepos.findByEmail(dto.getEmail())
                .orElseThrow(() -> new InvalidInputException("User not found"));

        log.info("Processing forgot password request for email: {}", dto.getEmail());

        String resetToken = passwordResetTokenService.generateToken(dto.getEmail());

        // Create reset password link
        String resetLink = "http://localhost:5173/reset-password?token=" + resetToken;

        // Send email
        String emailBody = String.format("""
                Hello %s,
                
                You have requested to reset your password. Please click the link below to reset it:
                %s
                
                This link will expire in 15 minutes.
                
                If you didn't request this, please ignore this email.
                
                Best regards,
                Your Application Team
                """, account.getFirstName(), resetLink);

        emailService.sendMail("Admin", dto.getEmail(), "Password Reset Request", emailBody);

        log.info("Password reset email sent to: {}", dto.getEmail());
    }

    @Override
    public void resetPassword(ResetPasswordRequestDto request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new InvalidInputException("Passwords do not match");
        }

        String email = passwordResetTokenService.getEmailFromToken(request.getToken())
                .orElseThrow(() -> new InvalidInputException("Invalid or expired reset token"));

        Account account = accountRepos.findByEmail(email)
                .orElseThrow(() -> new InvalidInputException("User not found"));

        // Update password
        account.setPassword(passwordEncoderConfig.bcryptEncoder().encode(request.getNewPassword()));
        accountRepos.save(account);

        // Invalidate the token
        passwordResetTokenService.invalidateToken(request.getToken());

        // For security, revoke all refresh tokens
        refreshTokenService.revokeRefreshTokenByAccountEmail(email);

        log.info("Password successfully reset for user: {}", email);
    }

    private Result authenticate(Account account, Fingerprint fingerprint) {
        Jwt jwt = tokenService.generateJwt(account.getEmail(), account.getRole());
        String token = jwt.getTokenValue();

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(
                account.getEmail(), fingerprint
        );

        JwtAuthenticationToken authenticationToken = new JwtAuthenticationToken(
                jwt,
                List.of(new SimpleGrantedAuthority(account.getRole().toString()))
        );

        SecurityContextHolder.getContext().setAuthentication(authenticationToken);

        log.debug(
                "Authentication context created under token {} granted to {} with role {}",
                token, account.getEmail(), account.getRole()
        );

        AuthResponseDto dto = new AuthResponseDto()
                .token(token)
                .refreshToken(refreshToken.getToken())
                .email(account.getEmail())
                .accountResponseDTO(accountMapper.toDTO(account));

        return new Result(token, dto);
    }

    private record Result(String jwt, AuthResponseDto dto) {
    }

}
