package com.fptgang.backend.service;

import java.math.BigDecimal;
import java.util.Map;

public interface CurrencyExchangeService {
    Map<String, BigDecimal> getExchangeRates();
    BigDecimal convertCurrency(BigDecimal amount, String fromCurrency, String toCurrency);
    Map<String, BigDecimal> fetchExchangeRates();
    void updateExchangeRates();
}
