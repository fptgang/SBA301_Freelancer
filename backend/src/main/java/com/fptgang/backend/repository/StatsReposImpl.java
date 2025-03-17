package com.fptgang.backend.repository;

import com.fptgang.backend.model.stats.StringBigDecimalDatapoint;
import com.fptgang.backend.model.stats.StringIntegerDatapoint;
import com.fptgang.backend.util.DateGroupingUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public class StatsReposImpl implements StatsRepos {

    @PersistenceContext
    private EntityManager entityManager;
    @Autowired
    private DateGroupingUtil dateGroupingUtil;

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

    @Override
    public List<StringIntegerDatapoint> getTotalRevenue(LocalDateTime startDate,
                                                        LocalDateTime endDate,
                                                        String groupBy) {
        DateGroupingUtil.DateGroupConfig config = dateGroupingUtil.getDateGroupConfig(groupBy, "t");

        String jpql = """
        SELECT NEW com.fptgang.backend.model.stats.StringIntegerDatapoint(
            MIN(%s),
            CAST(SUM(t.amount) AS integer)
        )
        FROM Transaction t
        WHERE t.createdAt BETWEEN :startDate AND :endDate
        AND t.status = 'SUCCESS'
        GROUP BY %s
        ORDER BY MIN(t.createdAt) ASC
    """.formatted(config.dateFormat, config.groupExpression);

        return entityManager.createQuery(jpql, StringIntegerDatapoint.class)
                .setParameter("startDate", startDate)
                .setParameter("endDate", endDate)
                .getResultList();
    }

    @Override
    public List<StringIntegerDatapoint> getTotalTransactions(LocalDateTime startDate,
                                                             LocalDateTime endDate,
                                                             String groupBy) {
        DateGroupingUtil.DateGroupConfig config = dateGroupingUtil.getDateGroupConfig(groupBy, "t");

        String jpql = """
        SELECT NEW com.fptgang.backend.model.stats.StringIntegerDatapoint(
            MIN(%s || '-' || t.status),
            CAST(COUNT(t.transactionId) AS integer)
        )
        FROM Transaction t
        WHERE t.createdAt BETWEEN :startDate AND :endDate
        GROUP BY %s, t.status
        ORDER BY MIN(t.createdAt) ASC
    """.formatted(config.dateFormat, config.groupExpression);

        return entityManager.createQuery(jpql, StringIntegerDatapoint.class)
                .setParameter("startDate", startDate)
                .setParameter("endDate", endDate)
                .getResultList();
    }

    @Override
    public List<StringIntegerDatapoint> getNewProjectsCreated(LocalDateTime startDate,
                                                              LocalDateTime endDate,
                                                              String groupBy) {
        DateGroupingUtil.DateGroupConfig config = dateGroupingUtil.getDateGroupConfig(groupBy, "p");


        String jpql = """
        SELECT NEW com.fptgang.backend.model.stats.StringIntegerDatapoint(
            MIN(%s),
            CAST(COUNT(p.projectId) AS integer)
        )
        FROM Project p
        WHERE p.createdAt BETWEEN :startDate AND :endDate
        GROUP BY %s
        ORDER BY MIN(p.createdAt) ASC
    """.formatted(config.dateFormat, config.groupExpression);

        return entityManager.createQuery(jpql, StringIntegerDatapoint.class)
                .setParameter("startDate", startDate)
                .setParameter("endDate", endDate)
                .getResultList();
    }

    @Override
    public List<StringIntegerDatapoint> getContractsSigned(LocalDateTime startDate,
                                                           LocalDateTime endDate,
                                                           String groupBy) {
        DateGroupingUtil.DateGroupConfig config = dateGroupingUtil.getDateGroupConfig(groupBy, "c");

        String jpql = """
        SELECT NEW com.fptgang.backend.model.stats.StringIntegerDatapoint(
            MIN(%s),
            CAST(COUNT(c.contractId) AS SIGNED)
        )
        FROM Contract c
        WHERE c.signedAt BETWEEN :startDate AND :endDate
        AND c.status = 'SIGNED'
        GROUP BY %s
        ORDER BY MIN(c.signedAt) ASC
    """.formatted(config.dateFormat, config.groupExpression);

        return entityManager.createQuery(jpql, StringIntegerDatapoint.class)
                .setParameter("startDate", startDate)
                .setParameter("endDate", endDate)
                .getResultList();
    }

    @Override
    public List<StringIntegerDatapoint> getMilestonesCompleted(LocalDateTime startDate,
                                                               LocalDateTime endDate,
                                                               String groupBy) {
        DateGroupingUtil.DateGroupConfig config = dateGroupingUtil.getDateGroupConfig(groupBy, "m");

        String jpql = """
        SELECT NEW com.fptgang.backend.model.stats.StringIntegerDatapoint(
            MIN(%s),
            CAST(COUNT(m.milestoneId) AS SIGNED)
        )
        FROM Milestone m
        WHERE m.updatedAt BETWEEN :startDate AND :endDate
        AND m.status = 'FINISHED'
        GROUP BY %s
        ORDER BY MIN(m.updatedAt) ASC
    """.formatted(config.dateFormat, config.groupExpression);

        return entityManager.createQuery(jpql, StringIntegerDatapoint.class)
                .setParameter("startDate", startDate)
                .setParameter("endDate", endDate)
                .getResultList();
    }

    @Override
    public List<StringIntegerDatapoint> getFundsReleased(LocalDateTime startDate,
                                                            LocalDateTime endDate,
                                                            String groupBy) {
        DateGroupingUtil.DateGroupConfig config = dateGroupingUtil.getDateGroupConfig(groupBy, "m");

        String jpql = """
        SELECT NEW com.fptgang.backend.model.stats.StringBigDecimalDatapoint(
            MIN(%s),
            SUM(m.budgetRatio)
        )
        FROM Milestone m
        WHERE m.updatedAt BETWEEN :startDate AND :endDate
        AND m.fundStatus = 'RELEASED'
        GROUP BY %s
        ORDER BY MIN(m.updatedAt) ASC
    """.formatted(config.dateFormat, config.groupExpression);

        return entityManager.createQuery(jpql, StringIntegerDatapoint.class)
                .setParameter("startDate", startDate)
                .setParameter("endDate", endDate)
                .getResultList();
    }

    @Override
    public List<StringBigDecimalDatapoint> getProjectTerminationRate(LocalDateTime startDate,
                                                                 LocalDateTime endDate,
                                                                 String groupBy) {
        DateGroupingUtil.DateGroupConfig config = dateGroupingUtil.getDateGroupConfig(groupBy, "p");

        String jpql = """
        SELECT NEW com.fptgang.backend.model.stats.StringDoubleDatapoint(
            MIN(%s),
            CAST(100.0 * SUM(CASE WHEN p.status = 'TERMINATED' THEN 1 ELSE 0 END) / COUNT(p.projectId) AS DOUBLE)
        )
        FROM Project p
        WHERE p.createdAt BETWEEN :startDate AND :endDate
        GROUP BY %s
        ORDER BY MIN(p.createdAt) ASC
    """.formatted(config.dateFormat, config.groupExpression);

        return entityManager.createQuery(jpql, StringBigDecimalDatapoint.class)
                .setParameter("startDate", startDate)
                .setParameter("endDate", endDate)
                .getResultList();
    }
}