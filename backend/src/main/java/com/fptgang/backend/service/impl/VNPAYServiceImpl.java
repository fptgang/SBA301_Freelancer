package com.fptgang.backend.service.impl;

import com.fptgang.backend.config.VnPayConfig;
import com.fptgang.backend.service.VNPAYService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
public class VNPAYServiceImpl implements VNPAYService {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final VnPayConfig vnPayConfig;

    public VNPAYServiceImpl(VnPayConfig vnPayConfig) {
        this.vnPayConfig = vnPayConfig;
    }

    @Override
    public String createVNPay(String orderInfo, BigDecimal amount, String txnRef, String vnp_IpAddr) {
        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnp_Params.put("vnp_Amount", String.valueOf(amount.multiply(BigDecimal.valueOf(100)).longValue()));
        vnp_Params.put("vnp_CreateDate", FORMATTER.format(now));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_OrderInfo", orderInfo);
        vnp_Params.put("vnp_OrderType", "250000");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnp_Params.put("vnp_ExpireDate", FORMATTER.format(now.plusMinutes(15)));
        vnp_Params.put("vnp_TxnRef", txnRef);

//        Account account = transaction.getAccount();
//        if (account == null) {
//            throw new IllegalArgumentException("Account does not exist");
//        }

//        //Billing
//        vnp_Params.put("vnp_Bill_Mobile", "0123456789");
//        vnp_Params.put("vnp_Bill_Email", account.getEmail());
//        vnp_Params.put("vnp_Bill_FirstName", "");
//        vnp_Params.put("vnp_Bill_LastName", "");
//        if(account.getFirstName() != null && !account.getFirstName().isEmpty()) {
//            vnp_Params.put("vnp_Bill_FirstName", account.getFirstName());
//        }
//        if(account.getLastName() != null && !account.getLastName().isEmpty()) {
//            vnp_Params.put("vnp_Bill_LastName", account.getLastName());
//        }
//
//        vnp_Params.put("vnp_Bill_Address", "123");
//        vnp_Params.put("vnp_Bill_City", "Hanoi");
//        vnp_Params.put("vnp_Bill_Country", "Vietnam");
//        vnp_Params.put("vnp_Bill_State", "Hanoi");
//
//        // Invoice
//        vnp_Params.put("vnp_Inv_Phone", "0123456789");
//        vnp_Params.put("vnp_Inv_Email", account.getEmail());
//        vnp_Params.put("vnp_Inv_Customer", normalize(account.getFirstName() + " " + account.getLastName()) );
//        vnp_Params.put("vnp_Inv_Address", "123");
//        vnp_Params.put("vnp_Inv_Company", "FPT");
//        vnp_Params.put("vnp_Inv_Taxcode", "123456789");
//        vnp_Params.put("vnp_Inv_Type", "1");

        //Build data to hash and querystring
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                //Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                //Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = VnPayConfig.hmacSHA512(vnPayConfig.getSecretKey(), hashData.toString());
        String paymentUrl = vnPayConfig.getPayUrl() + "?" + queryUrl + "&vnp_SecureHash=" + vnp_SecureHash;

        log.info("VnPay URL: " + paymentUrl);

        return paymentUrl;
    }

}