package com.fptgang.backend.repository;

import com.fptgang.backend.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface AccountRepos extends JpaRepository<Account, Long> {
    Optional<Account> findByEmail(String mail);
}
