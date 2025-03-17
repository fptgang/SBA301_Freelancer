package com.fptgang.backend.service;

import com.fptgang.backend.model.stats.StringBigDecimalDatapoint;
import com.fptgang.backend.model.stats.StringIntegerDatapoint;
import com.fptgang.backend.model.stats.TransactionStat;

import java.time.LocalDate;
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

    /**
     * Get the total number of transactions grouped by status (successful, pending,
     * failed).
     * Useful for monitoring transaction volume and system performance.
     * 📊 **Recommended Chart Type:** Line Chart / Bar Chart
     * - X-axis: Time period (day/week/month)
     * - Y-axis: Number of transactions by status
     */
    List<TransactionStat> getTransactionStats(LocalDate startDate, LocalDate endDate, String groupBy);

    /**
     * Get the number of new projects created over time.
     * Useful for tracking platform activity and growth.
     * 📊 **Recommended Chart Type:** Line Chart / Bar Chart
     * - X-axis: Time period (day/week/month)
     * - Y-axis: Number of new projects
     */
    List<StringIntegerDatapoint> getNewProjectStats(LocalDate startDate, LocalDate endDate, String groupBy);

    /**
     * Get the number of contracts signed over time.
     * Useful for tracking business growth and conversion rates.
     * 📊 **Recommended Chart Type:** Line Chart / Bar Chart
     * - X-axis: Time period (day/week/month)
     * - Y-axis: Number of contracts signed
     */
    List<StringIntegerDatapoint> getContractsSignedStats(LocalDate startDate, LocalDate endDate, String groupBy);

    /**
     * Get the number of milestones completed over time.
     * Useful for tracking project progress and freelancer productivity.
     * 📊 **Recommended Chart Type:** Line Chart / Bar Chart
     * - X-axis: Time period (day/week/month)
     * - Y-axis: Number of milestones completed
     */
    List<StringIntegerDatapoint> getMilestonesCompletedStats(LocalDate startDate, LocalDate endDate, String groupBy);

    /**
     * Get the total funds released from escrow over time.
     * Useful for tracking financial flows and platform revenue.
     * 📊 **Recommended Chart Type:** Line Chart / Bar Chart
     * - X-axis: Time period (day/week/month)
     * - Y-axis: Total funds released
     */
    List<StringBigDecimalDatapoint> getFundsReleasedStats(LocalDate startDate, LocalDate endDate, String groupBy);

    /**
     * Get the number of new user registrations over time.
     * Useful for tracking user acquisition and growth.
     * 📊 **Recommended Chart Type:** Line Chart / Bar Chart
     * - X-axis: Time period (day/week/month)
     * - Y-axis: Number of new users
     */
    List<StringIntegerDatapoint> getUserRegistrationsStats(LocalDate startDate, LocalDate endDate, String groupBy);

    /**
     * Get the percentage of projects terminated over time.
     * Useful for tracking project success/failure rates.
     * 📊 **Recommended Chart Type:** Line Chart / Pie Chart
     * - X-axis: Time period (day/week/month)
     * - Y-axis: Percentage of projects terminated
     */
    List<StringIntegerDatapoint> getProjectTerminationRateStats(LocalDate startDate, LocalDate endDate, String groupBy);
}
