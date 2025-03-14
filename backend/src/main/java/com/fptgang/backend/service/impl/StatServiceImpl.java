package com.fptgang.backend.service.impl;

import com.fptgang.backend.model.stats.StringIntegerDatapoint;
import com.fptgang.backend.repository.StatsRepos;
import com.fptgang.backend.service.StatService;
import org.springframework.stereotype.Service;

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

}
