package com.fptgang.backend.service.impl;

import com.fptgang.backend.dtos.request.RegisterRequestDTO;
import com.fptgang.backend.dtos.response.AccountResponseDTO;
import com.fptgang.backend.dtos.response.AuthResponseDTO;
import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.RefreshToken;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.RefreshTokenRepos;
import com.fptgang.backend.security.CustomUserDetailsService;
import com.fptgang.backend.security.PasswordEncoderConfig;
import com.fptgang.backend.security.TokenService;
import com.fptgang.backend.service.AuthService;
import com.fptgang.backend.service.RefreshTokenService;
import com.google.api.client.auth.openidconnect.IdToken;
import com.google.api.client.auth.openidconnect.IdTokenVerifier;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.LowLevelHttpRequest;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

import static org.springframework.security.oauth2.core.OAuth2TokenIntrospectionClaimNames.CLIENT_ID;


@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);
    private final AccountRepos accountRepos;

    @Autowired
    private CustomUserDetailsService customUserDetailService;
    @Autowired
    private TokenService tokenService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private PasswordEncoderConfig passwordEncoderConfig;
    @Autowired
    private RefreshTokenRepos refreshTokenRepos;

    @Autowired
    public AuthServiceImpl(AccountRepos accountRepos) {
        this.accountRepos = accountRepos;
    }

    @Override
    public Authentication getAuthentication(String email) {
        log.info("begin getAuthentication {}", email);
        UserDetails userDetails = customUserDetailService.loadUserByUsername(email);
        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return authentication;

    }

    @Override
    public AuthResponseDTO loginWithGoogle(String token) {
        log.info("begin login with google");
        HttpTransport httpTransport = new NetHttpTransport();
        JsonFactory jsonFactory = new GsonFactory();
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier(httpTransport, jsonFactory);
        try {
            GoogleIdToken idToken = verifier.verify(token);
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String[] name = payload.get("name").toString().split(" ");
            String firstName = name[0];
            String lastName = name.length > 1 ? name[1] : "";
            log.info(email + " " + name);
            Account account = accountRepos.findByEmail(email).orElseGet(() -> {
                Account newAccount = new Account();
                newAccount.setEmail(email);
                newAccount.setFirstName(firstName);
                newAccount.setLastName(lastName);
                newAccount.setRole(Role.USER);
                 accountRepos.saveAndFlush(newAccount);
                return newAccount;
            });
            Result result = authenticate(email, account);
            String newToken = tokenService.token(result.authentication);
            log.info("User logged in successfully {}", newToken);
            return AuthResponseDTO
                    .builder()
                    .accountResponseDTO(new AccountResponseDTO(account))
                    .email(email)
                    .token(newToken)
                    .refreshToken(result.refreshToken().getToken()).build();

        } catch (GeneralSecurityException | IOException e) {
            log.error("Error verifying token {}", e.getMessage());
        }
        return null;

    }

    @Override
    public AuthResponseDTO login(String email, String password) {
        log.info("begin login");
        try {
            Account account = accountRepos.findByEmail(email)
                    .orElseThrow(
                            () -> new InvalidInputException("User not found")
                    );
            if (passwordEncoderConfig.bcryptEncoder().matches(password, account.getPassword())) {
//                SecurityContextHolder.getContext().setAuthentication((authentication);
                Result result = authenticate(email, account);
                log.info("user logged in :{}", result.authentication().getName());
                String token = tokenService.token(result.authentication());

                log.info("User logged in successfully {}", token);
//                assert refreshToken != null;
                return AuthResponseDTO
                        .builder()
                        .accountResponseDTO(new AccountResponseDTO(account))
                        .email(email)
                        .token(token)
                        .refreshToken(result.refreshToken().getToken()).build();
            } else {
                throw new InvalidInputException("Password is incorrect");
            }
        } catch (Exception e) {
            log.error("Error Logging in {}", e.getMessage());
            throw new InvalidInputException(e.getMessage());
        }
    }

    private Result authenticate(String email, Account account) {
        RefreshToken refreshToken = refreshTokenService.findByAccountId(account.getAccountId());
        if (refreshToken == null) {
            refreshToken = refreshTokenService.createRefreshToken(email);
        } else {
            if (refreshTokenService.verifyExpiration(refreshToken) == null) {
                refreshToken = refreshTokenService.createRefreshToken(email);
            }
        }
        Authentication authentication = getAuthentication(email);
        return new Result(refreshToken, authentication);
    }

    private record Result(RefreshToken refreshToken, Authentication authentication) {
    }

    @Override
    public boolean register(RegisterRequestDTO registerRequestDTO) {
        if (accountRepos.findByEmail(registerRequestDTO.getEmail()).isEmpty()) {
            if (registerRequestDTO.getPassword().equals(registerRequestDTO.getConfirmPassword())) {
                Account account = new Account();
                account.setEmail(registerRequestDTO.getEmail());
                account.setFirstName(registerRequestDTO.getFirstName());
                account.setLastName(registerRequestDTO.getLastName());
                account.setRole(Role.USER);
                account.setPassword(passwordEncoderConfig.bcryptEncoder().encode(registerRequestDTO.getPassword()));
                accountRepos.save(account);
                return true;
            } else {
                throw new InvalidInputException("Password and Confirm Password do not match");
            }
        } else {
            throw new InvalidInputException("Email already exists");
        }
    }


    @Override
    @Transactional
    public boolean logout(Authentication authentication) {
        log.info("begin logout");
        SecurityContextHolder.getContext().setAuthentication(null);
        Account account = accountRepos.findByEmail(authentication.getName()).orElseThrow(
                () -> new InvalidInputException("User not found")
        );
        log.info("begin delete refreshToken");
        refreshTokenRepos.deleteByAccount(account);
        return true;
    }


}
