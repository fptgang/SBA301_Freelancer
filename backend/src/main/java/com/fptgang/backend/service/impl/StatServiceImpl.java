package com.fptgang.backend.service.impl;

import com.fptgang.backend.model.stats.StringBigDecimalDatapoint;
import com.fptgang.backend.model.stats.StringIntegerDatapoint;
import com.fptgang.backend.model.stats.TransactionStat;
import com.fptgang.backend.repository.StatsRepos;
import com.fptgang.backend.service.StatService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class StatServiceImpl implements StatService {
    private final StatsRepos statsRepos;

    public StatServiceImpl(StatsRepos statsRepos) {
        this.statsRepos = statsRepos;
    }

    @Override
    public List<StringIntegerDatapoint> getMonthlyNewCustomers() {
        return statsRepos.getMonthlyNewCustomers();
    }

    @Override
    public List<TransactionStat> getTransactionStats(LocalDate startDate, LocalDate endDate, String groupBy) {
        return statsRepos.getTransactionStats(startDate, endDate, groupBy);
    }

    @Override
    public List<StringIntegerDatapoint> getNewProjectStats(LocalDate startDate, LocalDate endDate, String groupBy) {
        return statsRepos.getNewProjectStats(startDate, endDate, groupBy);
    }

    @Override
    public List<StringIntegerDatapoint> getContractsSignedStats(LocalDate startDate, LocalDate endDate,
            String groupBy) {
        return statsRepos.getContractsSignedStats(startDate, endDate, groupBy);
    }

    @Override
    public List<StringIntegerDatapoint> getMilestonesCompletedStats(LocalDate startDate, LocalDate endDate,
            String groupBy) {
        return statsRepos.getMilestonesCompletedStats(startDate, endDate, groupBy);
    }

    @Override
    public List<StringBigDecimalDatapoint> getFundsReleasedStats(LocalDate startDate, LocalDate endDate,
            String groupBy) {
        return statsRepos.getFundsReleasedStats(startDate, endDate, groupBy);
    }

    @Override
    public List<StringIntegerDatapoint> getUserRegistrationsStats(LocalDate startDate, LocalDate endDate,
            String groupBy) {
        return statsRepos.getUserRegistrationsStats(startDate, endDate, groupBy);
    }

    @Override
    public List<StringIntegerDatapoint> getProjectTerminationRateStats(LocalDate startDate, LocalDate endDate,
            String groupBy) {
        return statsRepos.getProjectTerminationRateStats(startDate, endDate, groupBy);
    }
}
