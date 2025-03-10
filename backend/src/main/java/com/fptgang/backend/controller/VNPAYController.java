package com.fptgang.backend.controller;

import com.fptgang.backend.config.VnPayConfig;
import com.fptgang.backend.model.Transaction;
import com.fptgang.backend.service.PaymentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/vnpay")
public class VNPAYController   {
    private final PaymentService paymentService;
    private final VnPayConfig vnPayConfig;

    public VNPAYController(PaymentService paymentService, VnPayConfig vnPayConfig) {
        this.paymentService = paymentService;
        this.vnPayConfig = vnPayConfig;
    }

    @GetMapping("/vnpay_ipn")
    public int handleVNPayReturn(@RequestParam Map<String, String> requestParams) {
        Map<String, String> fields = new HashMap<>();
        for (Map.Entry<String, String> entry : requestParams.entrySet()) {
            fields.put(
                    URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII),
                    URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII)
            );
        }

        String txnRef = requestParams.get("vnp_TxnRef");
        String vnp_SecureHash = requestParams.get("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        log.info("vnp_TxnRef: " + txnRef, "vnp_SecureHash: " + vnp_SecureHash);

        if (vnPayConfig.hashAllFields(fields).equals(vnp_SecureHash)) {
            boolean success = "00".equals(fields.get("vnp_ResponseCode"));

            try {
                if (txnRef.startsWith("Deposit#")) {
                    txnRef = txnRef.substring("Deposit#".length());
                    long txnId = Long.parseLong(txnRef);
                    paymentService.handleDepositCallback(Transaction.PaymentMethod.VNPAY, txnId, success);
                } else {
                    log.info("FAILED: Invalid txnRef");
                    success = false;
                }
            } catch (NumberFormatException | ArrayIndexOutOfBoundsException e) {
                log.info("FAILED: Invalid txnRef", e);
                success = false;
            }

            return success ? 1 : 0;
        }

        log.info("FAILED: Invalid signature");
        return -1;
    }
}