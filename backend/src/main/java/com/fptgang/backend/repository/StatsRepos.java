package com.fptgang.backend.repository;

import com.fptgang.backend.model.stats.StringBigDecimalDatapoint;
import com.fptgang.backend.model.stats.StringIntegerDatapoint;

import java.time.LocalDateTime;
import java.util.List;

public interface StatsRepos {
    List<StringIntegerDatapoint> getMonthlyNewCustomers();
}
