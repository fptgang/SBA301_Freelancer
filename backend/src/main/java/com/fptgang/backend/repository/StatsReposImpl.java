package com.fptgang.backend.repository;

import com.fptgang.backend.model.stats.StringBigDecimalDatapoint;
import com.fptgang.backend.model.stats.StringIntegerDatapoint;
import com.fptgang.backend.model.stats.TransactionStat;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
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

    @Override
    public List<TransactionStat> getTransactionStats(LocalDate startDate, LocalDate endDate, String groupBy) {
        String jpql;
        switch (groupBy) {
            case "day" -> {
                jpql = """
                        SELECT NEW com.fptgang.backend.model.stats.TransactionStat(
                            MIN(CONCAT(CAST(YEAR(t.createdAt) AS string), '-', LPAD(CAST(MONTH(t.createdAt) AS string), 2, '0'), '-', LPAD(CAST(DAY(t.createdAt) AS string), 2, '0'))),
                            CAST(SUM(CASE WHEN t.status='SUCCESS' THEN 1 ELSE 0 END) AS integer),
                            CAST(SUM(CASE WHEN t.status='PENDING' THEN 1 ELSE 0 END) AS integer),
                            CAST(SUM(CASE WHEN t.status='FAILED' THEN 1 ELSE 0 END) AS integer)
                        )
                        FROM Transaction t
                        WHERE t.createdAt BETWEEN :startDate AND :endDate
                        GROUP BY YEAR(t.createdAt), MONTH(t.createdAt), DAY(t.createdAt)
                        ORDER BY YEAR(t.createdAt), MONTH(t.createdAt), DAY(t.createdAt)
                        """;
            }
            case "week" -> {
                jpql = """
                        SELECT NEW com.fptgang.backend.model.stats.TransactionStat(
                            MIN(CONCAT(CAST(YEAR(t.createdAt) AS string), '-W', LPAD(CAST(WEEK(t.createdAt) AS string), 2, '0'))),
                            CAST(SUM(CASE WHEN t.status='SUCCESS' THEN 1 ELSE 0 END) AS integer),
                            CAST(SUM(CASE WHEN t.status='PENDING' THEN 1 ELSE 0 END) AS integer),
                            CAST(SUM(CASE WHEN t.status='FAILED' THEN 1 ELSE 0 END) AS integer)
                        )
                        FROM Transaction t
                        WHERE t.createdAt BETWEEN :startDate AND :endDate
                        GROUP BY YEAR(t.createdAt), WEEK(t.createdAt)
                        ORDER BY YEAR(t.createdAt), WEEK(t.createdAt)
                        """;
            }
            default -> {
                jpql = """
                        SELECT NEW com.fptgang.backend.model.stats.TransactionStat(
                            MIN(CONCAT(CAST(YEAR(t.createdAt) AS string), '-', LPAD(CAST(MONTH(t.createdAt) AS string), 2, '0'))),
                            CAST(SUM(CASE WHEN t.status='SUCCESS' THEN 1 ELSE 0 END) AS integer),
                            CAST(SUM(CASE WHEN t.status='PENDING' THEN 1 ELSE 0 END) AS integer),
                            CAST(SUM(CASE WHEN t.status='FAILED' THEN 1 ELSE 0 END) AS integer)
                        )
                        FROM Transaction t
                        WHERE t.createdAt BETWEEN :startDate AND :endDate
                        GROUP BY YEAR(t.createdAt), MONTH(t.createdAt)
                        ORDER BY YEAR(t.createdAt), MONTH(t.createdAt)
                        """;
            }
        }
        ;
        return entityManager.createQuery(jpql, TransactionStat.class)
                .setParameter("startDate", startDate.atStartOfDay())
                .setParameter("endDate", endDate.plusDays(1).atStartOfDay())
                .getResultList();
    }

    @Override
    public List<StringIntegerDatapoint> getNewProjectStats(LocalDate startDate, LocalDate endDate, String groupBy) {
        String jpql = """
                SELECT NEW com.fptgang.backend.model.stats.StringIntegerDatapoint(
                    MIN(CONCAT(CAST(YEAR(p.createdAt) AS string), '-', LPAD(CAST(MONTH(p.createdAt) AS string), 2, '0'))),
                    CAST(COUNT(p.projectId) AS integer)
                )
                FROM Project p
                WHERE p.createdAt BETWEEN :startDate AND :endDate
                GROUP BY YEAR(p.createdAt), MONTH(p.createdAt)
                ORDER BY YEAR(p.createdAt), MONTH(p.createdAt)
                """;

        if (groupBy.equals("day")) {
            jpql = """
                    SELECT NEW com.fptgang.backend.model.stats.StringIntegerDatapoint(
                        MIN(CONCAT(CAST(YEAR(p.createdAt) AS string), '-', LPAD(CAST(MONTH(p.createdAt) AS string), 2, '0'), '-', LPAD(CAST(DAY(p.createdAt) AS string), 2, '0'))),
                        CAST(COUNT(p.projectId) AS integer)
                    )
                    FROM Project p
                    WHERE p.createdAt BETWEEN :startDate AND :endDate
                    GROUP BY YEAR(p.createdAt), MONTH(p.createdAt), DAY(p.createdAt)
                    ORDER BY YEAR(p.createdAt), MONTH(p.createdAt), DAY(p.createdAt)
                    """;
        } else if (groupBy.equals("week")) {
            jpql = """
                    SELECT NEW com.fptgang.backend.model.stats.StringIntegerDatapoint(
                        MIN(CONCAT(CAST(YEAR(p.createdAt) AS string), '-W', LPAD(CAST(WEEK(p.createdAt) AS string), 2, '0'))),
                        CAST(COUNT(p.projectId) AS integer)
                    )
                    FROM Project p
                    WHERE p.createdAt BETWEEN :startDate AND :endDate
                    GROUP BY YEAR(p.createdAt), WEEK(p.createdAt)
                    ORDER BY YEAR(p.createdAt), WEEK(p.createdAt)
                    """;
        }

        return entityManager.createQuery(jpql, StringIntegerDatapoint.class)
                .setParameter("startDate", startDate.atStartOfDay())
                .setParameter("endDate", endDate.plusDays(1).atStartOfDay())
                .getResultList();
    }

    @Override
    public List<StringIntegerDatapoint> getContractsSignedStats(LocalDate startDate, LocalDate endDate,
            String groupBy) {
        String jpql = """
                SELECT NEW com.fptgang.backend.model.stats.StringIntegerDatapoint(
                    MIN(CONCAT(CAST(YEAR(c.signedAt) AS string), '-', LPAD(CAST(MONTH(c.signedAt) AS string), 2, '0'))),
                    CAST(COUNT(c.contractId) AS integer)
                )
                FROM Contract c
                WHERE c.signedAt BETWEEN :startDate AND :endDate
                GROUP BY YEAR(c.signedAt), MONTH(c.signedAt)
                ORDER BY YEAR(c.signedAt), MONTH(c.signedAt)
                """;

        if (groupBy.equals("day")) {
            jpql = """
                    SELECT NEW com.fptgang.backend.model.stats.StringIntegerDatapoint(
                        MIN(CONCAT(CAST(YEAR(c.signedAt) AS string), '-', LPAD(CAST(MONTH(c.signedAt) AS string), 2, '0'), '-', LPAD(CAST(DAY(c.signedAt) AS string), 2, '0'))),
                        CAST(COUNT(c.contractId) AS integer)
                    )
                    FROM Contract c
                    WHERE c.signedAt BETWEEN :startDate AND :endDate
                    GROUP BY YEAR(c.signedAt), MONTH(c.signedAt), DAY(c.signedAt)
                    ORDER BY YEAR(c.signedAt), MONTH(c.signedAt), DAY(c.signedAt)
                    """;
        } else if (groupBy.equals("week")) {
            jpql = """
                    SELECT NEW com.fptgang.backend.model.stats.StringIntegerDatapoint(
                        MIN(CONCAT(CAST(YEAR(c.signedAt) AS string), '-W', LPAD(CAST(WEEK(c.signedAt) AS string), 2, '0'))),
                        CAST(COUNT(c.contractId) AS integer)
                    )
                    FROM Contract c
                    WHERE c.signedAt BETWEEN :startDate AND :endDate
                    GROUP BY YEAR(c.signedAt), WEEK(c.signedAt)
                    ORDER BY YEAR(c.signedAt), WEEK(c.signedAt)
                    """;
        }

        return entityManager.createQuery(jpql, StringIntegerDatapoint.class)
                .setParameter("startDate", startDate.atStartOfDay())
                .setParameter("endDate", endDate.plusDays(1).atStartOfDay())
                .getResultList();
    }

    @Override
    public List<StringIntegerDatapoint> getMilestonesCompletedStats(LocalDate startDate, LocalDate endDate,
            String groupBy) {
        String jpql = """
                SELECT NEW com.fptgang.backend.model.stats.StringIntegerDatapoint(
                    MIN(CONCAT(CAST(YEAR(m.deadline) AS string), '-', LPAD(CAST(MONTH(m.deadline) AS string), 2, '0'))),
                    CAST(COUNT(m.milestoneId) AS integer)
                )
                FROM Milestone m
                WHERE m.status = 'FINISHED' AND m.deadline BETWEEN :startDate AND :endDate
                GROUP BY YEAR(m.deadline), MONTH(m.deadline)
                ORDER BY YEAR(m.deadline), MONTH(m.deadline)
                """;

        if (groupBy.equals("day")) {
            jpql = """
                    SELECT NEW com.fptgang.backend.model.stats.StringIntegerDatapoint(
                        MIN(CONCAT(CAST(YEAR(m.deadline) AS string), '-', LPAD(CAST(MONTH(m.deadline) AS string), 2, '0'), '-', LPAD(CAST(DAY(m.deadline) AS string), 2, '0'))),
                        CAST(COUNT(m.milestoneId) AS integer)
                    )
                    FROM Milestone m
                    WHERE m.status = 'FINISHED' AND m.deadline BETWEEN :startDate AND :endDate
                    GROUP BY YEAR(m.deadline), MONTH(m.deadline), DAY(m.deadline)
                    ORDER BY YEAR(m.deadline), MONTH(m.deadline), DAY(m.deadline)
                    """;
        } else if (groupBy.equals("week")) {
            jpql = """
                    SELECT NEW com.fptgang.backend.model.stats.StringIntegerDatapoint(
                        MIN(CONCAT(CAST(YEAR(m.deadline) AS string), '-W', LPAD(CAST(WEEK(m.deadline) AS string), 2, '0'))),
                        CAST(COUNT(m.milestoneId) AS integer)
                    )
                    FROM Milestone m
                    WHERE m.status = 'FINISHED' AND m.deadline BETWEEN :startDate AND :endDate
                    GROUP BY YEAR(m.deadline), WEEK(m.deadline)
                    ORDER BY YEAR(m.deadline), WEEK(m.deadline)
                    """;
        }

        return entityManager.createQuery(jpql, StringIntegerDatapoint.class)
                .setParameter("startDate", startDate.atStartOfDay())
                .setParameter("endDate", endDate.plusDays(1).atStartOfDay())
                .getResultList();
    }

    @Override
    public List<StringBigDecimalDatapoint> getFundsReleasedStats(LocalDate startDate, LocalDate endDate,
            String groupBy) {
        String jpql = """
                SELECT NEW com.fptgang.backend.model.stats.StringBigDecimalDatapoint(
                    MIN(CONCAT(CAST(YEAR(t.createdAt) AS string), '-', LPAD(CAST(MONTH(t.createdAt) AS string), 2, '0'))),
                    SUM(t.amount)
                )
                FROM Transaction t
                WHERE t.createdAt BETWEEN :startDate AND :endDate
                AND t.type = 'ESCROW_RELEASE'
                GROUP BY YEAR(t.createdAt), MONTH(t.createdAt)
                ORDER BY YEAR(t.createdAt), MONTH(t.createdAt)
                """;

        if (groupBy.equals("day")) {
            jpql = """
                    SELECT NEW com.fptgang.backend.model.stats.StringBigDecimalDatapoint(
                        MIN(CONCAT(CAST(YEAR(t.createdAt) AS string), '-', LPAD(CAST(MONTH(t.createdAt) AS string), 2, '0'), '-', LPAD(CAST(DAY(t.createdAt) AS string), 2, '0'))),
                        SUM(t.amount)
                    )
                    FROM Transaction t
                    WHERE t.createdAt BETWEEN :startDate AND :endDate
                    AND t.type = 'ESCROW_RELEASE'
                    GROUP BY YEAR(t.createdAt), MONTH(t.createdAt), DAY(t.createdAt)
                    ORDER BY YEAR(t.createdAt), MONTH(t.createdAt), DAY(t.createdAt)
                    """;
        } else if (groupBy.equals("week")) {
            jpql = """
                    SELECT NEW com.fptgang.backend.model.stats.StringBigDecimalDatapoint(
                        MIN(CONCAT(CAST(YEAR(t.createdAt) AS string), '-W', LPAD(CAST(WEEK(t.createdAt) AS string), 2, '0'))),
                        SUM(t.amount)
                    )
                    FROM Transaction t
                    WHERE t.createdAt BETWEEN :startDate AND :endDate
                    AND t.type = 'ESCROW_RELEASE'
                    GROUP BY YEAR(t.createdAt), WEEK(t.createdAt)
                    ORDER BY YEAR(t.createdAt), WEEK(t.createdAt)
                    """;
        }

        return entityManager.createQuery(jpql, StringBigDecimalDatapoint.class)
                .setParameter("startDate", startDate.atStartOfDay())
                .setParameter("endDate", endDate.plusDays(1).atStartOfDay())
                .getResultList();
    }

    @Override
    public List<StringIntegerDatapoint> getUserRegistrationsStats(LocalDate startDate, LocalDate endDate,
            String groupBy) {
        String jpql = """
                SELECT NEW com.fptgang.backend.model.stats.StringIntegerDatapoint(
                    MIN(CONCAT(CAST(YEAR(a.createdAt) AS string), '-', LPAD(CAST(MONTH(a.createdAt) AS string), 2, '0'))),
                    CAST(COUNT(a.accountId) AS integer)
                )
                FROM Account a
                WHERE a.createdAt BETWEEN :startDate AND :endDate
                GROUP BY YEAR(a.createdAt), MONTH(a.createdAt)
                ORDER BY YEAR(a.createdAt), MONTH(a.createdAt)
                """;

        if (groupBy.equals("day")) {
            jpql = """
                    SELECT NEW com.fptgang.backend.model.stats.StringIntegerDatapoint(
                        MIN(CONCAT(CAST(YEAR(a.createdAt) AS string), '-', LPAD(CAST(MONTH(a.createdAt) AS string), 2, '0'), '-', LPAD(CAST(DAY(a.createdAt) AS string), 2, '0'))),
                        CAST(COUNT(a.accountId) AS integer)
                    )
                    FROM Account a
                    WHERE a.createdAt BETWEEN :startDate AND :endDate
                    GROUP BY YEAR(a.createdAt), MONTH(a.createdAt), DAY(a.createdAt)
                    ORDER BY YEAR(a.createdAt), MONTH(a.createdAt), DAY(a.createdAt)
                    """;
        } else if (groupBy.equals("week")) {
            jpql = """
                    SELECT NEW com.fptgang.backend.model.stats.StringIntegerDatapoint(
                        MIN(CONCAT(CAST(YEAR(a.createdAt) AS string), '-W', LPAD(CAST(WEEK(a.createdAt) AS string), 2, '0'))),
                        CAST(COUNT(a.accountId) AS integer)
                    )
                    FROM Account a
                    WHERE a.createdAt BETWEEN :startDate AND :endDate
                    GROUP BY YEAR(a.createdAt), WEEK(a.createdAt)
                    ORDER BY YEAR(a.createdAt), WEEK(a.createdAt)
                    """;
        }

        return entityManager.createQuery(jpql, StringIntegerDatapoint.class)
                .setParameter("startDate", startDate.atStartOfDay())
                .setParameter("endDate", endDate.plusDays(1).atStartOfDay())
                .getResultList();
    }

    @Override
    public List<StringIntegerDatapoint> getProjectTerminationRateStats(LocalDate startDate, LocalDate endDate,
            String groupBy) {
        String jpql = """
                SELECT NEW com.fptgang.backend.model.stats.StringIntegerDatapoint(
                    MIN(CONCAT(CAST(YEAR(p.updatedAt) AS string), '-', LPAD(CAST(MONTH(p.updatedAt) AS string), 2, '0'))),
                    CAST((COUNT(CASE WHEN p.status = 'TERMINATED' THEN 1 ELSE NULL END) * 100 / COUNT(p.projectId)) AS integer)
                )
                FROM Project p
                WHERE p.updatedAt BETWEEN :startDate AND :endDate
                GROUP BY YEAR(p.updatedAt), MONTH(p.updatedAt)
                ORDER BY YEAR(p.updatedAt), MONTH(p.updatedAt)
                """;

        if (groupBy.equals("day")) {
            jpql = """
                    SELECT NEW com.fptgang.backend.model.stats.StringIntegerDatapoint(
                        MIN(CONCAT(CAST(YEAR(p.updatedAt) AS string), '-', LPAD(CAST(MONTH(p.updatedAt) AS string), 2, '0'), '-', LPAD(CAST(DAY(p.updatedAt) AS string), 2, '0'))),
                        CAST((COUNT(CASE WHEN p.status = 'TERMINATED' THEN 1 ELSE NULL END) * 100 / COUNT(p.projectId)) AS integer)
                    )
                    FROM Project p
                    WHERE p.updatedAt BETWEEN :startDate AND :endDate
                    GROUP BY YEAR(p.updatedAt), MONTH(p.updatedAt), DAY(p.updatedAt)
                    ORDER BY YEAR(p.updatedAt), MONTH(p.updatedAt), DAY(p.updatedAt)
                    """;
        } else if (groupBy.equals("week")) {
            jpql = """
                    SELECT NEW com.fptgang.backend.model.stats.StringIntegerDatapoint(
                        MIN(CONCAT(CAST(YEAR(p.updatedAt) AS string), '-W', LPAD(CAST(WEEK(p.updatedAt) AS string), 2, '0'))),
                        CAST((COUNT(CASE WHEN p.status = 'TERMINATED' THEN 1 ELSE NULL END) * 100 / COUNT(p.projectId)) AS integer)
                    )
                    FROM Project p
                    WHERE p.updatedAt BETWEEN :startDate AND :endDate
                    GROUP BY YEAR(p.updatedAt), WEEK(p.updatedAt)
                    ORDER BY YEAR(p.updatedAt), WEEK(p.updatedAt)
                    """;
        }

        return entityManager.createQuery(jpql, StringIntegerDatapoint.class)
                .setParameter("startDate", startDate.atStartOfDay())
                .setParameter("endDate", endDate.plusDays(1).atStartOfDay())
                .getResultList();
    }

}