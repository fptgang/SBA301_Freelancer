package com.fptgang.backend.repository;

import com.fptgang.backend.model.Account;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepos extends JpaRepository<Account, Long>, JpaSpecificationExecutor<Account> {
    @Modifying
    @Transactional
    @Query(value = "ALTER TABLE account AUTO_INCREMENT = 1", nativeQuery = true)
    void resetAutoIncrement();
    Optional<Account> findByEmail(String mail);
    Optional<Account> findByAccountId(Long accountId);
}
