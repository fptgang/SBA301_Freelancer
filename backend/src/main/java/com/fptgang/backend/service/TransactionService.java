package com.fptgang.backend.service;

import com.fptgang.backend.model.Transaction;
import com.fptgang.backend.service.params.ListParams;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

public interface TransactionService {
    Transaction create(Transaction transaction);
    Transaction findById(long id);
    Transaction update(Transaction transaction);
    Page<Transaction> getAll(ListParams params);
}
