package com.fptgang.backend.repository;

import com.fptgang.model.Account;
import com.fptgang.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TransactionRepos extends JpaRepository<Transaction,Long> {
    Optional<Transaction> findByTransactionId(Long transactionId);
}
