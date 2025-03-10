package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.TransactionsApi;
import com.fptgang.backend.api.model.GetTransactions200Response;
import com.fptgang.backend.api.model.Pageable;
import com.fptgang.backend.api.model.TransactionDto;
import com.fptgang.backend.mapper.DetailLevel;
import com.fptgang.backend.mapper.TransactionMapper;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.model.Transaction;
import com.fptgang.backend.service.TransactionService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.OpenApiHelper;
import com.fptgang.backend.util.SecurityUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.NativeWebRequest;

import java.util.Optional;

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
    public ResponseEntity<TransactionDto> getTransactionById(Long transactionId) {
        log.info("Getting transaction by id {}", transactionId);
        Transaction transaction = transactionService.findById(transactionId);
        if (!SecurityUtil.hasPermission(Role.ADMIN)) {
            long currentUserId = SecurityUtil.requireCurrentUserId();
            if (transaction.getFromAccount() != null &&
                    transaction.getFromAccount().getAccountId() != currentUserId) {
                throw new AccessDeniedException("You are not allowed to view this transaction");
            }
            if (transaction.getToAccount() != null &&
                    transaction.getToAccount().getAccountId() != currentUserId) {
                throw new AccessDeniedException("You are not allowed to view this transaction");
            }
        }
        return new ResponseEntity<>(
                transactionMapper.toDTO(
                        transactionService.findById(transactionId),
                        DetailLevel.FULL
                ),
                HttpStatus.OK
        );
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

        // Staffs and Customers can only view their own transactions
        if (!SecurityUtil.hasPermission(Role.ADMIN)) {
            params.setFilter("account.accountId", "eq", SecurityUtil.getCurrentUserId());
        }

        var resultPage = transactionService.getAll(params.build())
                .map(t -> transactionMapper.toDTO(t, DetailLevel.SUMMARY));

        return OpenApiHelper.respondPage(resultPage, GetTransactions200Response.class);
    }


}