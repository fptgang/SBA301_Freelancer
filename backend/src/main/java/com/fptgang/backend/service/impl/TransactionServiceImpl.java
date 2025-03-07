package com.fptgang.backend.service.impl;

import com.fptgang.backend.config.VnPayConfig;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.Transaction;
import com.fptgang.backend.repository.TransactionRepos;
import com.fptgang.backend.service.TransactionService;
import com.fptgang.backend.service.VNPAYService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.OpenApiHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class TransactionServiceImpl implements TransactionService {
    private static final Logger LOGGER = LoggerFactory.getLogger(TransactionServiceImpl.class);
    private final TransactionRepos transactionRepos;
    private final VNPAYService VNPAYService;

    public TransactionServiceImpl(TransactionRepos transactionRepos, VNPAYService VNPAYService) {
        this.transactionRepos = transactionRepos;
        this.VNPAYService = VNPAYService;
    }

    @Override
    public String create(Transaction transaction) {
        try {
            transaction.setStatus(Transaction.TransactionStatus.FAILED);
            transaction = transactionRepos.save(transaction);
            if (transaction.getPaymentMethod() == Transaction.PaymentMethod.VNPAY) {
                return VNPAYService.createVNPay(transaction);
            }
            return "Transaction created successfully";
        } catch (Exception e) {
            LOGGER.info("Transaction creation failed {}", e.getMessage());
            throw new IllegalArgumentException("Transaction creation failed");
        }
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
    public Page<Transaction> getAll(ListParams params) {
        var spec = OpenApiHelper.groupBy( params.<Transaction>toSpec(), "transactionId");
        return transactionRepos.findAll(spec, params.getPageable());
    }

    @Override
    public Page<Transaction> getAll(Pageable pageable, BigDecimal minAmount, BigDecimal maxAmount) {
        return transactionRepos.findByAmountBetween(minAmount, maxAmount, pageable);
    }
}
