package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.AuthApi;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.mapper.AccountMapper;
import com.fptgang.backend.mapper.RefreshTokenMapper;
import com.fptgang.backend.model.RefreshToken;
import com.fptgang.backend.security.TokenService;
import com.fptgang.backend.service.AccountService;
import com.fptgang.backend.service.AuthService;
import com.fptgang.backend.service.RefreshTokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("api/v1")
public class AuthController implements AuthApi {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final TokenService tokenService;
    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final AccountService accountService;
    private final AccountMapper accountMapper;
    private final RefreshTokenMapper refreshTokenMapper;

    public AuthController(AuthService authService, RefreshTokenService refreshTokenService, AuthenticationManager authenticationManager, TokenService tokenService, AccountService accountService, AccountMapper accountMapper, RefreshTokenMapper refreshTokenMapper) {
        this.authService = authService;
        this.refreshTokenService = refreshTokenService;
        this.tokenService = tokenService;
        this.accountService = accountService;
        this.accountMapper = accountMapper;
        this.refreshTokenMapper = refreshTokenMapper;
    }

    @Override
    public ResponseEntity<AuthResponseDto> loginWithGoogle(String body) {
        return ResponseEntity.ok(authService.loginWithGoogle(body.replace("\"", "")));
    }

    @Override
    public ResponseEntity<AccountDto> getCurrentUser(String token) {
        if (token == null || token.isEmpty()) {
            //            throw new InvalidInputException("User not found");
            return ResponseEntity.ok(null);
        }
        log.info("begin getCurrentUser" + token);
        String email = tokenService.getEmailFromToken(token);
        log.info("email: {}", email);
        if (email == null || email.isEmpty()) {
            return ResponseEntity.ok(null);
        }
        //        System.out.println(authentication.getName());
        return ResponseEntity.ok(accountMapper.toDTO(accountService.findByEmail(email)));

    }

    @Override
    public ResponseEntity<JwtResponseDto> refreshToken(String token) {
        log.info("begin refreshToken for token :{}", token);
        RefreshToken refreshToken = refreshTokenService.findByToken(token).map(refreshTokenService::verifyExpiration).orElseThrow(() -> new InvalidInputException("Invalid token"));
        log.info("refreshToken: {}", refreshToken);

        return refreshTokenService.findByToken(token).map(refreshTokenService::verifyExpiration).map(RefreshToken::getAccount).map(userInfo -> {
            Authentication authentication1 = authService.getAuthentication(userInfo.getEmail());
            String accessToken = tokenService.token(authentication1);
            log.info("new accessToken: {}", accessToken);
            JwtResponseDto jwtResponseDto = new JwtResponseDto();
            jwtResponseDto.setAccessToken(accessToken);
            jwtResponseDto.setRefreshToken(token);
            return ResponseEntity.ok(jwtResponseDto);
        }).orElseThrow(() -> new InvalidInputException("Invalid token"));

    }

    @Override
    public ResponseEntity<AuthResponseDto> login(LoginRequestDto loginRequestDto) {
        refreshTokenService.createRefreshToken(loginRequestDto.getEmail());
        return ResponseEntity.ok(authService.login(loginRequestDto.getEmail(), loginRequestDto.getPassword()));
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
    public ResponseEntity<Void> logout() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        authService.logout(authentication);
        return ResponseEntity.ok().build();
    }

}

