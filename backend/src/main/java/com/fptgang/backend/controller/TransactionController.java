package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.TransactionsApi;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.mapper.DetailLevel;
import com.fptgang.backend.mapper.TransactionMapper;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.model.Transaction;
import com.fptgang.backend.security.AuthContext;
import com.fptgang.backend.service.PaymentService;
import com.fptgang.backend.service.TransactionService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.OpenApiHelper;
import com.fptgang.backend.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1")
public class TransactionController implements TransactionsApi {
    private final TransactionService transactionService;
    private final TransactionMapper transactionMapper;
    private final PaymentService paymentService;
    private final AuthContext authContext;

    public TransactionController(TransactionService transactionService,
                                 TransactionMapper transactionMapper,
                                 PaymentService paymentService,
                                 AuthContext authContext) {
        this.transactionService = transactionService;
        this.transactionMapper = transactionMapper;
        this.paymentService = paymentService;
        this.authContext = authContext;
    }

    /**
     * Can access: Authenticated users
     */
    @Override
    @PreAuthorize("isAuthenticated()")
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

    /**
     * Can access: Authenticated users
     * - Staff+ can view all
     * - Client/Freelancer can only see his transactions
     */
    @Override
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GetTransactions200Response> getTransactions(Pageable pageable, String filter, String search) {
        log.info("Fetching transactions");

        var params = ListParams.builder()
                .pageable(OpenApiHelper.toPageable(pageable))
                .search(search)
                .filter(filter);

        // Staff, Admin can view all transactions
        if (SecurityUtil.hasPermission(Role.STAFF)||
                SecurityUtil.hasPermission(Role.ADMIN)) {
            return OpenApiHelper.respondPage(
                    transactionService.getAll(params.build())
                            .map(t -> transactionMapper.toDTO(t, DetailLevel.SUMMARY)),
                    GetTransactions200Response.class
            );
        }
        // Customers can only view their own transactions
        else {
            return OpenApiHelper.respondPage(
                    transactionService.getAllInvolvingAccount(params.build(), SecurityUtil.requireCurrentUserId())
                            .map(t -> transactionMapper.toDTO(t, DetailLevel.SUMMARY)),
                    GetTransactions200Response.class
            );
        }
    }

    /**
     * Can access: Authenticated users
     * - Staff+ can view all
     * - Client/Freelancer can only see his transactions
     */
    @Override
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TransactionDto> getTransactionById(Long transactionId) {
        Transaction transaction = transactionService.findById(transactionId);
        if (transaction == null) {
            return ResponseEntity.notFound().build();
        }

        if (!authContext.hasInternalAccess(transaction))
            throw new AccessDeniedException("Cannot access this transaction");

        return ResponseEntity.ok(transactionMapper.toDTO(transaction, DetailLevel.FULL));
    }

    @Override
    public ResponseEntity<TransactionDto> createWithdrawRequest(@Valid @RequestBody TransactionDto transactionDto){
        Transaction transaction = transactionService.createWithdrawalRequest(transactionMapper.toEntity(transactionDto));

        if(!SecurityUtil.hasPermission(Role.FREELANCER) &&
                !SecurityUtil.hasPermission(Role.CLIENT)
        ){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(transactionMapper.toDTO(transaction, DetailLevel.FULL));
    }

    @Override
    public ResponseEntity<TransactionDto> updateWithdrawRequest(@Valid @RequestBody TransactionDto transactionDto){
        Transaction transaction = transactionService.updateWithdrawalStatus(transactionMapper.toEntity(transactionDto));

        if(!SecurityUtil.hasPermission(Role.STAFF) &&
                !SecurityUtil.hasPermission(Role.ADMIN)
        ){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(transactionMapper.toDTO(transaction, DetailLevel.FULL));
    }

}