package com.fptgang.backend.service.impl;

import com.fptgang.backend.mapper.CurrencyResponse;
import com.fptgang.backend.service.CurrencyExchangeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;

@Service
public class CurrencyServiceImpl implements CurrencyExchangeService {
    @Value("${currency.api.url}")
    private String apiUrl;

    @Value("${currency.api.key}")
    private String apiKey;

    private Map<String, BigDecimal> cachedRates;

    private final RestTemplate restTemplate;
    @Autowired
    public CurrencyServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    @Cacheable("exchangeRates")
    public Map<String, BigDecimal> getExchangeRates() {
        if (cachedRates == null) {
            cachedRates = fetchExchangeRates();  // Fallback if not cached yet
        }
        return cachedRates;
    }

    @Override
    public BigDecimal convertCurrency(BigDecimal amount, String fromCurrency, String toCurrency) {
        Map<String, BigDecimal> rates = getExchangeRates();
        if (rates == null || !rates.containsKey(fromCurrency) || !rates.containsKey(toCurrency)) {
            throw new IllegalArgumentException("Invalid currency code");
        }

        BigDecimal fromRate = rates.get(fromCurrency);
        BigDecimal toRate = rates.get(toCurrency);

        return amount.multiply(toRate).divide(fromRate, 2, BigDecimal.ROUND_HALF_UP);
    }

    @Override
    public Map<String, BigDecimal> fetchExchangeRates() {
        String url = String.format("%s?access_key=%s", apiUrl,apiKey);
        CurrencyResponse response = restTemplate.getForObject(url,CurrencyResponse.class);
        return response != null ? response.getRates() : null;
    }

    @Override
    @Scheduled(fixedRate = 3600000)
    public void updateExchangeRates() {
        cachedRates = fetchExchangeRates();
        System.out.println("Exchange rates updated!");
    }
}
