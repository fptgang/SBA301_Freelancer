package com.fptgang.backend.service;

import com.fptgang.backend.model.Transaction;

public interface VNPAYService {
    String createVNPay(Transaction transaction);
}
