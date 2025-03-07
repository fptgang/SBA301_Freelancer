package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.TransactionsApi;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.config.VnPayConfig;
import com.fptgang.backend.mapper.DetailLevel;
import com.fptgang.backend.mapper.TransactionMapper;
import com.fptgang.backend.model.Transaction;
import com.fptgang.backend.service.TransactionService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.OpenApiHelper;
import com.fptgang.backend.util.SecurityUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1")
public class TransactionController implements TransactionsApi {
    private final TransactionService transactionService;
    private final TransactionMapper transactionMapper;


    public TransactionController(TransactionService transactionService, TransactionMapper transactionMapper) {
        this.transactionService = transactionService;
        this.transactionMapper = transactionMapper;
    }

    @Override
    public ResponseEntity<String> createDeposit(TransactionDto transactionDto) {
        log.info("Creating transaction");
        transactionDto.setFromAccountId(SecurityUtil.getCurrentUserId());
        transactionDto.setType(TransactionDto.TypeEnum.DEPOSIT);
        ResponseEntity<String> response = new ResponseEntity<>(transactionService
                .create(transactionMapper.toEntity(transactionDto)),
                HttpStatus.OK);
        return response;

    }
    @Override
    public ResponseEntity<TransactionDto> getTransactionById(Long transactionId) {
        return new ResponseEntity<>(transactionMapper.toDTO(transactionService.findById(transactionId), DetailLevel.FULL), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<GetTransactions200Response> getTransactions(Pageable pageable, String filter, String search) {
        log.info("Getting transactions");
        var page = OpenApiHelper.toPageable(pageable);
        var params = ListParams.builder()
                .pageable(page)
                .search(search)
                .filter(filter);
        var res = transactionService
                .getAll(params.build())
                .map(transaction -> transactionMapper.toDTO(transaction, DetailLevel.REFERENCE));
        return OpenApiHelper.respondPage(res, GetTransactions200Response.class);
    }


}
