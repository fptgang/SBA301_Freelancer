package com.fptgang.backend.service.impl;

import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.Transaction;
import com.fptgang.backend.repository.TransactionRepos;
import com.fptgang.backend.service.TransactionService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.EntityUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepos transactionRepos;

    @Autowired
    public TransactionServiceImpl(TransactionRepos transactionRepos) {
        this.transactionRepos = transactionRepos;
    }

    @Override
    public Transaction create(Transaction transaction) {
        if (transaction.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidInputException("Amount must be greater than 0");
        }
        transaction.setCreatedAt(LocalDateTime.now());
        return transactionRepos.save(transaction);
    }

    @Override
    public Transaction findById(long id) {
        return transactionRepos.findById(id).orElse(null);
    }

    @Override
    public Transaction update(Transaction transaction) {
        Transaction existing = transactionRepos.findById(transaction.getTransactionId())
                .orElseThrow(() -> new InvalidInputException("Transaction does not exist"));
        EntityUtil.merge(existing, transaction);
        return transactionRepos.save(existing);
    }

    @Override
    public Page<Transaction> getAll(ListParams params) {
        var spec = params.<Transaction>toSpec();
        return transactionRepos.findAll(spec, params.getPageable());
    }
}