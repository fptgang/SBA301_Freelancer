package com.fptgang.backend.service;

import java.math.BigDecimal;

public interface VNPAYService {
    String createVNPay(String orderInfo, BigDecimal amount, String txnRef, String vnp_IpAddr);
}
