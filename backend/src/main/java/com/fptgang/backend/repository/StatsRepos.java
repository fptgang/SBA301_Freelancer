package com.fptgang.backend.repository;

import com.fptgang.backend.model.stats.StringBigDecimalDatapoint;
import com.fptgang.backend.model.stats.StringIntegerDatapoint;
import com.fptgang.backend.model.stats.TransactionStat;

import java.time.LocalDate;
import java.util.List;

public interface StatsRepos {
    List<StringIntegerDatapoint> getMonthlyNewCustomers();

    List<TransactionStat> getTransactionStats(LocalDate startDate, LocalDate endDate, String groupBy);

    List<StringIntegerDatapoint> getNewProjectStats(LocalDate startDate, LocalDate endDate, String groupBy);

    List<StringIntegerDatapoint> getContractsSignedStats(LocalDate startDate, LocalDate endDate, String groupBy);

    List<StringIntegerDatapoint> getMilestonesCompletedStats(LocalDate startDate, LocalDate endDate, String groupBy);

    List<StringBigDecimalDatapoint> getFundsReleasedStats(LocalDate startDate, LocalDate endDate, String groupBy);

    List<StringIntegerDatapoint> getUserRegistrationsStats(LocalDate startDate, LocalDate endDate, String groupBy);

    List<StringIntegerDatapoint> getProjectTerminationRateStats(LocalDate startDate, LocalDate endDate, String groupBy);

}
