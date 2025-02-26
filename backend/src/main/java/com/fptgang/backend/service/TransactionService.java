package com.fptgang.backend.service;

import com.fptgang.backend.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

public interface TransactionService {
    String create(Transaction transaction, String vnp_IpAddr);
    Transaction findById(long id);
    Transaction update(Transaction transaction);
    Page<Transaction> getAll(Pageable pageable, String filter, String search);
    default Page<Transaction> getAll(Pageable pageable, String filter) {
        return getAll(pageable, filter, null);
    }
    Page<Transaction> getAll(Pageable pageable, BigDecimal minAmount, BigDecimal maxAmount);
}
