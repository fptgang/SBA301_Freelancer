package com.fptgang.backend.repository;

import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepos extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findRefreshTokenByTokenEquals(String token);

    @Modifying
    int deleteByAccount(Account account);

    Optional<RefreshToken> findByAccount_AccountId(Long accountId);
}
