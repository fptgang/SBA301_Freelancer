package com.fptgang.backend.service;

import com.fptgang.backend.model.stats.StringIntegerDatapoint;

import java.util.List;

public interface StatService {

    /**
     * Get the number of new customers who registered monthly.
     * Useful for tracking long-term customer growth.
     * 📊 **Recommended Chart Type:** Line Chart / Column Chart
     * - Line Chart: Shows customer growth trend.
     * - Column Chart: Better for monthly comparisons.
     * 🔹 **Data format:** [{key: yyyy-MM, value: newCustomers}]
     */
    List<StringIntegerDatapoint> getMonthlyNewCustomers();
}
