package com.fptgang.backend.mapper;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
public class CurrencyResponse {
    private Map<String, BigDecimal> rates;

}
