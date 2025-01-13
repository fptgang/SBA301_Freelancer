package com.fptgang.backend.repository;

import com.fptgang.backend.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface TransactionRepos extends JpaRepository<Transaction,Long> {
    Optional<Transaction> findByTransactionId(Long transactionId);
}
