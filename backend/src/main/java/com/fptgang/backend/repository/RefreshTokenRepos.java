package com.fptgang.backend.repository;

import com.fptgang.backend.model.RefreshToken;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RefreshTokenRepos extends JpaRepository<RefreshToken, Long> {
    RefreshToken findByToken(String token);
    Page<RefreshToken> findAllByAccount_AccountId(Long accountId, Pageable pageable);
    void deleteAllByAccount_Email(String email);
    void deleteAllBySessionId(String sessionId);
}
