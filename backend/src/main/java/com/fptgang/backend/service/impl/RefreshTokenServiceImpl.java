package com.fptgang.backend.service.impl;

import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.RefreshToken;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.RefreshTokenRepos;
import com.fptgang.backend.security.TokenService;
import com.fptgang.backend.service.RefreshTokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private static final Logger log = LoggerFactory.getLogger(RefreshTokenServiceImpl.class);
    RefreshTokenRepos refreshTokenRepository;

    AccountRepos accountRepos;

    @Autowired
    public RefreshTokenServiceImpl(RefreshTokenRepos refreshTokenRepository, AccountRepos accountRepos, TokenService tokenService) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.accountRepos = accountRepos;
    }

    public RefreshToken createRefreshToken(String username) {
        Account account = accountRepos.findByEmail(username)
                .orElseThrow(() -> new InvalidInputException("Account not found with email " + username));

        // Check if a refresh token already exists for the account
        Optional<RefreshToken> existingToken = refreshTokenRepository.findByAccount_AccountId(account.getAccountId());
        if (existingToken.isPresent()) {
            return existingToken.get();
        }

        RefreshToken refreshToken = RefreshToken.builder()
                .account(account)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(600000)) // set expiry of refresh token to 10 minutes - you can configure it application.properties file
                .build();

        RefreshToken savedRefreshToken = refreshTokenRepository.save(refreshToken);
        accountRepos.save(account); // Save the account to update the refresh token association

        return savedRefreshToken;
    }

    @Override
    public RefreshToken findByAccountId(Long accountId) {
        return refreshTokenRepository.findByAccount_AccountId(accountId)
                .orElse(null);
    }


    public Optional<RefreshToken> findByToken(String token) {
        String cleanToken = token.replaceAll("\"", "");

        log.info("Cleaned Token: " + cleanToken);
        return refreshTokenRepository.findByToken(cleanToken);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            log.info("Refresh token is expired. Please make a new login..!");
            return null;
//            throw new InvalidInputException(token.getToken() + " Refresh token is expired. Please make a new login..!");
        }
        return token;
    }
}
