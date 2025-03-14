package com.fptgang.backend.util;

import java.time.*;
import java.util.TimeZone;
import java.time.format.DateTimeFormatter;

public class DateTimeUtil {
    private static final ZoneId SERVER_ZONE_ID = ZoneId.of("GMT+7");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("MMMM dd, yyyy, HH:mm:ss");

    public static void validateTimeZone() {
        TimeZone.setDefault(TimeZone.getTimeZone(SERVER_ZONE_ID));

        ZoneOffset serverOffset = SERVER_ZONE_ID.getRules().getOffset(ZonedDateTime.now().toInstant());
        ZoneOffset systemOffset = ZoneId.systemDefault().getRules().getOffset(ZonedDateTime.now().toInstant());

        if (!serverOffset.equals(systemOffset)) {
            throw new RuntimeException("Mismatch timezone offset: system = " + systemOffset +
                    ", expect = " + serverOffset);
        }
    }

    public static LocalDateTime fromOffsetToLocal(OffsetDateTime offsetDateTime) {
        if (offsetDateTime == null) {
            return null;
        }
        return offsetDateTime
                .atZoneSameInstant(SERVER_ZONE_ID)
                .toLocalDateTime();
    }

    public static OffsetDateTime fromLocalToOffset(LocalDateTime localDateTime) {
        if (localDateTime == null) {
            return null;
        }
        return localDateTime.atZone(SERVER_ZONE_ID).toOffsetDateTime();
    }

    public static OffsetDateTime fromInstantToOffset(Instant expiryDate) {
        if (expiryDate == null) {
            return null;
        }
        return OffsetDateTime.ofInstant(expiryDate, SERVER_ZONE_ID);
    }

    public static String formatDate(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(DATE_FORMATTER);
    }

    public static String formatTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(TIME_FORMATTER);
    }

    public static String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(DATETIME_FORMATTER);
    }
}