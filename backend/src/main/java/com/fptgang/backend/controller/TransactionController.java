package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.TransactionsApi;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.mapper.DetailLevel;
import com.fptgang.backend.mapper.TransactionMapper;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.model.Transaction;
import com.fptgang.backend.service.PaymentService;
import com.fptgang.backend.service.TransactionService;
import com.fptgang.backend.service.impl.PaymentServiceImpl;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.OpenApiHelper;
import com.fptgang.backend.util.SecurityUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1")
public class TransactionController implements TransactionsApi {
    private final TransactionService transactionService;
    private final TransactionMapper transactionMapper;
    private final PaymentService paymentService;

    public TransactionController(TransactionService transactionService, TransactionMapper transactionMapper, PaymentService paymentService) {
        this.transactionService = transactionService;
        this.transactionMapper = transactionMapper;
        this.paymentService = paymentService;
    }



    @Override
    public ResponseEntity<CreateDeposit200Response> createDeposit(DepositDto depositDto) {
        depositDto.setAccountId(SecurityUtil.getCurrentUserId());
        Transaction transaction = transactionService.create(
                transactionMapper.toEntity(depositDto)
        );
        String paymentLink = paymentService.generatePaymentLinkForDeposit(
                Transaction.PaymentMethod.VNPAY,
                depositDto.getAmount(),
                transaction.getTransactionId()
        );  

        return new ResponseEntity<>( new CreateDeposit200Response().paymentRedirectUrl(paymentLink), HttpStatus.OK);
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