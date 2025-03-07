package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.TransactionsApi;
import com.fptgang.backend.api.model.GetTransactions200Response;
import com.fptgang.backend.api.model.Pageable;
import com.fptgang.backend.api.model.TransactionDto;
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
@RequestMapping("/api/v1/vnpay")
public class VNPAYController{
    private final TransactionService transactionService;


    public VNPAYController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/vnpay_ipn")
    public int handleVNPayReturn(@RequestParam Map<String, String> requestParams) throws UnsupportedEncodingException {
        Map fields = new HashMap();
        for (Map.Entry<String, String> entry : requestParams.entrySet()) {
            fields.put(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII.toString()), URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII.toString()));
        }
        String paymentId = requestParams.get("vnp_TxnRef");
        String vnp_SecureHash = requestParams.get("vnp_SecureHash");
        if (fields.containsKey("vnp_SecureHashType")) {
            fields.remove("vnp_SecureHashType");
        }
        if (fields.containsKey("vnp_SecureHash")) {
            fields.remove("vnp_SecureHash");
        }
        Transaction transaction = transactionService.findById(Long.parseLong(paymentId));
        if (transaction == null) {
            log.info("Transaction not found");
            return -1;
        }
        if (VnPayConfig.hashAllFields(fields).equals(vnp_SecureHash)) {
            if ("00".equals(fields.get("vnp_ResponseCode"))) {
                log.info("Payment success");
//                if(transaction.getType() == Transaction.Type.DEPOSIT) {
//                    transaction.getAccount().setBalance(transaction.getAccount().getBalance().add(transaction.getAmount()));
//                } else if(transaction.getType() == Transaction.Type.ORDER) {
//
//                }
                transaction.setStatus(Transaction.TransactionStatus.SUCCESS);
                transactionService.update(transaction);
                return 1;
            } else {
                log.info("Payment failed");
//                transaction.setOldBalance(transaction.getAccount().getBalance());
//                transaction.setNewBalance(transaction.getAccount().getBalance());
                transaction.setStatus(Transaction.TransactionStatus.FAILED);
                transactionService.update(transaction);
                return 0;
            }
        }
        log.info("FAILED: Invalid signature");
        return -1;
    }
}
