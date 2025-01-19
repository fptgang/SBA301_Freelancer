package com.fptgang.backend.repository;

import com.fptgang.backend.model.RefreshToken;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface RefreshTokenRepos extends JpaRepository<RefreshToken, Long> {
    RefreshToken findByToken(String token);
    Page<RefreshToken> findAllByAccount_AccountId(Long accountId, Pageable pageable);
    void deleteAllByAccount_Email(String email);
    void deleteAllBySessionId(String sessionId);

    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiryDate < :now")
    int deleteByExpiryDateBefore(@Param("now") Instant now);
}
