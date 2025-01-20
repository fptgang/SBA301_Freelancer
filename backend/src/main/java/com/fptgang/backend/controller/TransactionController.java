package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.ProjectsApi;
import com.fptgang.backend.api.controller.TransactionsApi;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.mapper.TransactionMapper;
import com.fptgang.backend.service.TransactionService;
import com.fptgang.backend.util.OpenApiHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
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
                .toDTO(transactionService.create(transactionMapper.toEntity(transactionDto))), HttpStatus.OK);
        ;
        return response;

    }
    @Override
    public ResponseEntity<TransactionDto> getTransactionById(Long transactionId) {
        return new ResponseEntity<>(transactionMapper.toDTO(transactionService.findById(transactionId)), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<GetTransactions200Response> getTransactions(GetAccountsPageableParameter pageable, String filter) {
        log.info("Getting transactions");
        var page = OpenApiHelper.toPageable(pageable);
        var res = transactionService.getAll(page, filter).map(transactionMapper::toDTO);
        return OpenApiHelper.respondPage(res, GetTransactions200Response.class);
    }

    @Override
    public ResponseEntity<TransactionDto> updateTransaction(String transactionId, TransactionDto transactionDto) {
        return new ResponseEntity<>(transactionMapper.toDTO(transactionService.update(transactionMapper.toEntity(transactionDto))), HttpStatus.OK);
    }

}
