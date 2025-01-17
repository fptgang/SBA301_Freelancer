package com.fptgang.backend.util;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class DateTimeUtilTest {

    @Test
    void testFromOffsetToLocal() {
        OffsetDateTime offsetDateTime = OffsetDateTime.parse("2025-01-14T10:30:45+02:00");
        LocalDateTime result = DateTimeUtil.fromOffsetToLocal(offsetDateTime);
        assertNotNull(result);
        assertEquals(LocalDateTime.parse("2025-01-14T15:30:45"), result);
    }

    @Test
    void testFromLocalToOffset() {
        LocalDateTime localDateTime = LocalDateTime.parse("2025-01-14T15:30:45");
        OffsetDateTime result = DateTimeUtil.fromLocalToOffset(localDateTime);
        assertNotNull(result);
        assertEquals(OffsetDateTime.parse("2025-01-14T15:30:45+07:00"), result);
    }
}
