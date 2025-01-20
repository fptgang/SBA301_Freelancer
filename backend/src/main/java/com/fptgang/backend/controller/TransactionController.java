package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.ProjectsApi;
import com.fptgang.backend.api.controller.TransactionsApi;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.mapper.TransactionMapper;
import com.fptgang.backend.service.TransactionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController implements TransactionsApi {
    private final TransactionService transactionService;
    private final TransactionMapper transactionMapper;


    public TransactionController(TransactionService transactionService, TransactionMapper transactionMapper) {
        this.transactionService = transactionService;
        this.transactionMapper = transactionMapper;
    }

    @Override
    public ResponseEntity<TransactionDto> createTransaction(TransactionDto transactionDto) {
        log.info("Creating transaction");

        ResponseEntity<TransactionDto> response = new ResponseEntity<>(transactionMapper
                .toDTO(transactionService.create(transactionMapper.toEntity(transactionDto))), HttpStatus.CREATED);
        ;
        return response;

    }

    @Override
    public ResponseEntity<Void> deleteTransaction(String transactionId) {
        return TransactionsApi.super.deleteTransaction(transactionId);
    }

    @Override
    public ResponseEntity<TransactionDto> getTransactionById(String transactionId) {
        return TransactionsApi.super.getTransactionById(transactionId);
    }

    @Override
    public ResponseEntity<GetTransactions200Response> getTransactions(GetAccountsPageableParameter pageable, String filter) {
        return TransactionsApi.super.getTransactions(pageable, filter);
    }

    @Override
    public ResponseEntity<TransactionDto> updateTransaction(String transactionId, TransactionDto transactionDto) {
        return TransactionsApi.super.updateTransaction(transactionId, transactionDto);
    }

}
