package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.AuthApi;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.mapper.AccountMapper;
import com.fptgang.backend.service.JwtService;
import com.fptgang.backend.service.AccountService;
import com.fptgang.backend.service.AuthService;
import com.fptgang.backend.util.Fingerprint;
import com.fptgang.backend.util.SecurityUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.UUID;

@RestController
@RequestMapping("api/v1")
public class AuthController implements AuthApi {
    private static final Duration SESSION_ID_EXPIRY_DURATION = Duration.ofDays(30);
    private static final Logger LOGGER = LoggerFactory.getLogger(AuthController.class);

    private final JwtService jwtService;
    private final AuthService authService;
    private final AccountService accountService;
    private final AccountMapper accountMapper;
    private final HttpServletRequest httpServletRequest;
    private final HttpServletResponse httpServletResponse;

    public AuthController(JwtService jwtService,
                          AuthService authService,
                          AccountService accountService,
                          AccountMapper accountMapper,
                          HttpServletRequest httpServletRequest,
                          HttpServletResponse httpServletResponse) {
        this.jwtService = jwtService;
        this.authService = authService;
        this.accountService = accountService;
        this.accountMapper = accountMapper;
        this.httpServletRequest = httpServletRequest;
        this.httpServletResponse = httpServletResponse;
    }

    @Override
    public ResponseEntity<AuthResponseDto> loginWithGoogle(String body) {
        try {
            AuthResponseDto dto = authService.loginWithGoogle(
                    body.replace("\"", ""),
                    getFingerprint()
            );
            attachSessionIdCookie();
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @Override
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AccountDto> getCurrentUser() {
        String email = SecurityUtil.requireCurrentUserEmail();
        return ResponseEntity.ok(accountMapper.toDTO(accountService.findByEmail(email)));
    }

    @Override
    public ResponseEntity<JwtResponseDto> refreshToken(String token) {
        JwtResponseDto jwtResponseDto = new JwtResponseDto();
        jwtResponseDto.setAccessToken(jwtService.createJwtFromRefreshToken(token));
        jwtResponseDto.setRefreshToken(token);
        return ResponseEntity.ok(jwtResponseDto);
    }

    @Override
    public ResponseEntity<AuthResponseDto> login(LoginRequestDto loginRequestDto) {
        try {
            AuthResponseDto dto = authService.login(
                    loginRequestDto.getEmail(),
                    loginRequestDto.getPassword(),
                    getFingerprint()
            );
            attachSessionIdCookie();
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @Override
    public ResponseEntity<Void> forgotPassword(ForgotPasswordRequestDto forgotPasswordRequestDto) {
        authService.forgotPassword(forgotPasswordRequestDto);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<Void> register(RegisterRequestDto registerRequestDto) {
        if (authService.register(registerRequestDto)) return ResponseEntity.status(HttpStatus.CREATED).build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }

    @Override
    public ResponseEntity<Void> resetPassword(ResetPasswordRequestDto resetPasswordRequestDto) {
        authService.resetPassword(resetPasswordRequestDto);
        return ResponseEntity.ok().build();
    }

    @Override
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> logout() {
        String email = SecurityUtil.requireCurrentUserEmail();
        authService.logout(email, getFingerprint());
        return ResponseEntity.ok().build();
    }

    private void attachSessionIdCookie() {
        String sessionId = UUID.randomUUID().toString();
        Cookie cookie = new Cookie("sessionId", sessionId);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge((int) SESSION_ID_EXPIRY_DURATION.getSeconds());
        httpServletResponse.addCookie(cookie);
    }

    private Fingerprint getFingerprint() {
        String sessionId = null;
        Cookie[] cookies = httpServletRequest.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("sessionId".equals(cookie.getName())) {
                    sessionId = cookie.getValue();
                    break;
                }
            }
        }

        String ipAddress = httpServletRequest.getRemoteAddr();

        return Fingerprint.builder()
                .sessionId(sessionId)
                .ipAddress(ipAddress)
                .clientInfo("")
                .build();
    }
}

