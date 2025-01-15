package com.fptgang.backend.controller;

import com.fptgang.backend.api.model.AccountDto;
import com.fptgang.backend.dtos.request.ForgotPasswordRequestDTO;
import com.fptgang.backend.dtos.request.LoginRequestDTO;
import com.fptgang.backend.dtos.request.RegisterRequestDTO;
import com.fptgang.backend.dtos.request.ResetPasswordRequestDTO;
import com.fptgang.backend.dtos.response.AccountResponseDTO;
import com.fptgang.backend.dtos.response.AuthResponseDTO;
import com.fptgang.backend.dtos.response.JwtResponseDTO;
import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.mapper.AccountMapper;
import com.fptgang.backend.model.RefreshToken;
import com.fptgang.backend.security.TokenService;
import com.fptgang.backend.service.AccountService;
import com.fptgang.backend.service.AuthService;
import com.fptgang.backend.service.RefreshTokenService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.slf4j.Logger;

import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("api/v1/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final TokenService tokenService;
    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final AccountService accountService;
    private final AccountMapper accountMapper;

    public AuthController(AuthService authService, RefreshTokenService refreshTokenService, AuthenticationManager authenticationManager, TokenService tokenService, AccountService accountService, AccountMapper accountMapper) {
        this.authService = authService;
        this.refreshTokenService = refreshTokenService;
        this.tokenService = tokenService;
        this.accountService = accountService;
        this.accountMapper = accountMapper;
    }


    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO loginRequestDTO) {
        //        refreshTokenService.createRefreshToken(loginRequestDTO.getEmail());
        return ResponseEntity.ok(authService.login(loginRequestDTO.getEmail(), loginRequestDTO.getPassword()));
    }

    @PostMapping("/register")
    public ResponseEntity<Boolean> register(@RequestBody RegisterRequestDTO registerRequestDTO) {
        if (authService.register(registerRequestDTO))
            return ResponseEntity.status(HttpStatus.CREATED).build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }

    @GetMapping("/logout")
    @SecurityRequirement(name = "Bearer Authentication")
    public ResponseEntity<Boolean> logout(Authentication authentication) {
        log.info("begin logout");
        return ResponseEntity.ok(authService.logout(authentication));
    }


    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/me")
    public ResponseEntity<AccountDto> getCurrentUser(@RequestParam(required = false) String token) {
        if (token == null || token.isEmpty()) {
            //            throw new InvalidInputException("User not found");
            return ResponseEntity.ok(null);
        }
        log.info("begin getCurrentUser");
        String email = tokenService.getEmailFromToken(token);
        log.info("email: {}", email);
        if (email == null || email.isEmpty()) {
            return ResponseEntity.ok(null);
        }
        //        System.out.println(authentication.getName());
        return ResponseEntity.ok(accountMapper.toDTO(accountService.findByEmail(email)));
    }

    @PostMapping("/refreshToken")
    public JwtResponseDTO refreshToken(@RequestBody String token) {
        log.info("begin refreshToken for token :{}", token);
        RefreshToken refreshToken = refreshTokenService.findByToken(token)
                .map(refreshTokenService::verifyExpiration)
                .orElseThrow(() -> new InvalidInputException("Invalid token"));
        log.info("refreshToken: {}", refreshToken);

        return refreshTokenService.findByToken(token)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getAccount)
                .map(userInfo -> {
                    Authentication authentication1 = authService.getAuthentication(userInfo.getEmail());
                    String accessToken = tokenService.token(authentication1);
                    log.info("new accessToken: {}", accessToken);
                    return JwtResponseDTO.builder()
                            .accessToken(accessToken)
                            .refreshToken(token).build();
                }).orElseThrow(() -> new InvalidInputException("Invalid token"));
    }

    @PostMapping("/login-with-google")
    public ResponseEntity<AuthResponseDTO> loginWithGoogle(@RequestBody String token) {
        return ResponseEntity.ok(authService.loginWithGoogle(token));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestBody ForgotPasswordRequestDTO forgotPasswordRequestDTO) {
        authService.forgotPassword(forgotPasswordRequestDTO);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody ResetPasswordRequestDTO request) {
        authService.resetPassword(request);
        return ResponseEntity.ok().build();
    }
}

