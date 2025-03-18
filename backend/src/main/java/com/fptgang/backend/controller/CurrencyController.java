package com.fptgang.backend.controller;

import com.fptgang.backend.service.CurrencyExchangeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("api/currencies")
public class CurrencyController {
    private final CurrencyExchangeService currencyExchangeService;

    @Autowired
    public CurrencyController(CurrencyExchangeService currencyExchangeService) {
        this.currencyExchangeService = currencyExchangeService;
    }

    @GetMapping("/rates")
    public Map<String, BigDecimal> getExchangeRates() {
        return currencyExchangeService.getExchangeRates();
    }

    @GetMapping("/convert")
    public BigDecimal convertCurrency(
            @RequestParam BigDecimal amount,
            @RequestParam String fromCurrency,
            @RequestParam String toCurrency) {
        return currencyExchangeService.convertCurrency(amount, fromCurrency, toCurrency);
    }
}
