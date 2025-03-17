package com.fptgang.backend.util;

import org.springframework.stereotype.Component;

@Component
public class DateGroupingUtil {

    public static class DateGroupConfig {
        public final String dateFormat;
        public final String groupExpression;

        public DateGroupConfig(String dateFormat, String groupExpression) {
            this.dateFormat = dateFormat;
            this.groupExpression = groupExpression;
        }
    }

    public DateGroupConfig getDateGroupConfig(String groupBy, String entityAlias) {
        String dateFormat;
        String groupExpression;

        switch (groupBy.toUpperCase()) {
            case "DAY":
                dateFormat = "CAST(YEAR(%s.createdAt) AS string) || '-' || " +
                        "LPAD(CAST(MONTH(%s.createdAt) AS string), 2, '0') || '-' || " +
                        "LPAD(CAST(DAY(%s.createdAt) AS string), 2, '0')";
                groupExpression = "YEAR(%s.createdAt), MONTH(%s.createdAt), DAY(%s.createdAt)";
                break;
            case "WEEK":
                dateFormat = "CAST(YEAR(%s.createdAt) AS string) || '-W' || " +
                        "LPAD(CAST(WEEK(%s.createdAt) AS string), 2, '0')";
                groupExpression = "YEAR(%s.createdAt), WEEK(%s.createdAt)";
                break;
            case "MONTH":
                dateFormat = "CAST(YEAR(%s.createdAt) AS string) || '-' || " +
                        "LPAD(CAST(MONTH(%s.createdAt) AS string), 2, '0')";
                groupExpression = "YEAR(%s.createdAt), MONTH(%s.createdAt)";
                break;
            default:
                throw new IllegalArgumentException("Invalid groupBy parameter. Use DAY, WEEK, or MONTH");
        }

        return new DateGroupConfig(
                String.format(dateFormat, entityAlias),
                String.format(groupExpression, entityAlias)
        );
    }
}