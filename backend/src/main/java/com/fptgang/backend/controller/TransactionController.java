package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.TransactionsApi;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.mapper.DetailLevel;
import com.fptgang.backend.mapper.TransactionMapper;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.service.TransactionService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.OpenApiHelper;
import com.fptgang.backend.util.SecurityUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<String> createDeposit(DepositDto depositDto) {
        return TransactionsApi.super.createDeposit(depositDto);
    }

    @Override
    public ResponseEntity<GetTransactions200Response> getTransactions(Pageable pageable, String filter, String search) {
        log.info("Fetching transactions");

        var includeInvisible = SecurityUtil.hasPermission(Role.ADMIN);
        var params = ListParams.builder()
                .pageable(OpenApiHelper.toPageable(pageable))
                .search(search)
                .filter(filter)
                .includeInvisible(includeInvisible);

        // Staff, Admin can view all transactions
        if (SecurityUtil.hasPermission(Role.STAFF)) {
            return OpenApiHelper.respondPage(
                    transactionService.getAll(params.build())
                            .map(t -> transactionMapper.toDTO(t, DetailLevel.SUMMARY)),
                    GetTransactions200Response.class
            );
        }
        // Customers can only view their own transactions
        else {
            return OpenApiHelper.respondPage(
                    transactionService.getAllInvolvingAccount(params.build(), SecurityUtil.getCurrentUserId())
                            .map(t -> transactionMapper.toDTO(t, DetailLevel.SUMMARY)),
                    GetTransactions200Response.class
            );
        }
    }

}