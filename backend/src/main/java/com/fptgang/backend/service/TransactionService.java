package com.fptgang.backend.service;

import com.fptgang.backend.model.Milestone;
import com.fptgang.backend.model.Transaction;
import com.fptgang.backend.service.params.ListParams;
import jakarta.annotation.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

public interface TransactionService {
    Transaction create(Transaction transaction);
    Transaction createEscrowDeposit(Milestone milestone);
    Transaction createEscrowRelease(Milestone milestone);
    Transaction createEscrowRefund(Milestone milestone);
    Transaction findById(long id);
    Transaction findByMilestone(Transaction.TransactionType type, Transaction.TransactionStatus status, Long milestoneId);
    boolean existByMilestone(Transaction.TransactionType type, Transaction.TransactionStatus status, Long milestoneId);
    Transaction update(Transaction transaction);
    Page<Transaction> getAll(ListParams params);
    Page<Transaction> getAllInvolvingAccount(ListParams params, Long accountId);
}
