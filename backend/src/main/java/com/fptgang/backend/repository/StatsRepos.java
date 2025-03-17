package com.fptgang.backend.repository;

import com.fptgang.backend.model.stats.StringBigDecimalDatapoint;
import com.fptgang.backend.model.stats.StringIntegerDatapoint;

import java.time.LocalDateTime;
import java.util.List;

public interface StatsRepos {
    List<StringIntegerDatapoint> getMonthlyNewCustomers();

    List<StringIntegerDatapoint> getTotalRevenue(LocalDateTime startDate,
                                                 LocalDateTime endDate,
                                                 String groupBy);

    List<StringIntegerDatapoint> getTotalTransactions(LocalDateTime startDate,
                                                      LocalDateTime endDate,
                                                      String groupBy);

    List<StringIntegerDatapoint> getNewProjectsCreated(LocalDateTime startDate,
                                                       LocalDateTime endDate,
                                                       String groupBy);

    List<StringIntegerDatapoint> getContractsSigned(LocalDateTime startDate,
                                                    LocalDateTime endDate,
                                                    String groupBy);

    List<StringIntegerDatapoint> getMilestonesCompleted(LocalDateTime startDate, LocalDateTime endDate, String groupBy);

    List<StringIntegerDatapoint> getFundsReleased(LocalDateTime startDate, LocalDateTime endDate, String groupBy);

    List<StringBigDecimalDatapoint> getProjectTerminationRate(LocalDateTime startDate, LocalDateTime endDate, String groupBy);

}
