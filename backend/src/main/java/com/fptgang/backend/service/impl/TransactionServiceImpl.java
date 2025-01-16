package com.fptgang.backend.service.impl;

import com.fptgang.backend.model.Transaction;
import com.fptgang.backend.repository.TransactionRepos;
import com.fptgang.backend.service.TransactionService;
import com.fptgang.backend.util.OpenApiHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class TransactionServiceImpl implements TransactionService {
    private static final Logger LOGGER = LoggerFactory.getLogger(TransactionServiceImpl.class);
    private final TransactionRepos transactionRepos;

    public TransactionServiceImpl(TransactionRepos transactionRepos) {
        this.transactionRepos = transactionRepos;
    }

    @Override
    public Transaction create(Transaction transaction) {
        return transactionRepos.save(transaction);
    }

    @Override
    public Transaction findById(long id) {
        return transactionRepos.findById(id).orElse(null);
    }

    @Override
    public Transaction update(Transaction transaction) {
        if (transaction.getTransactionId() == null || !transactionRepos.existsById(transaction.getTransactionId())) {
            throw new IllegalArgumentException("Transaction does not exist");
        }
        return transactionRepos.save(transaction);
    }

    @Override
    public Page<Transaction> getAll(Pageable pageable, String filter) {
        var spec = OpenApiHelper.<Transaction>toSpecification(filter);
        return transactionRepos.findAll(spec, pageable);
    }

    @Override
    public Page<Transaction> getAll(Pageable pageable, BigDecimal minAmount, BigDecimal maxAmount) {
        return transactionRepos.findByAmountBetween(minAmount, maxAmount, pageable);
    }
}
