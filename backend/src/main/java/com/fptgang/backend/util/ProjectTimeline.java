package com.fptgang.backend.util;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class ProjectTimeline {
    private LocalDateTime projectStartDate;
    private Map<Long, LocalDateTime> milestoneDeadlines;
}
