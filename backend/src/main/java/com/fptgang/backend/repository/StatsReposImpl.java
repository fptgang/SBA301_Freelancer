package com.fptgang.backend.repository;

import com.fptgang.backend.model.stats.StringIntegerDatapoint;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class StatsReposImpl implements StatsRepos {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<StringIntegerDatapoint> getMonthlyNewCustomers() {
        String jpql = """
        SELECT NEW com.fptgang.backend.model.stats.StringIntegerDatapoint(
            MIN(CONCAT(CAST(YEAR(a.createdAt) AS string), '-', LPAD(CAST(MONTH(a.createdAt) AS string), 2, '0'))),
            CAST(COUNT(a.accountId) AS integer)
        )
        FROM Account a
        GROUP BY YEAR(a.createdAt), MONTH(a.createdAt)
        ORDER BY YEAR(a.createdAt) ASC, MONTH(a.createdAt) ASC
        """;

        return entityManager.createQuery(jpql, StringIntegerDatapoint.class)
                .getResultList();
    }
}