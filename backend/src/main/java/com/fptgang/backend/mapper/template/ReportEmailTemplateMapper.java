package com.fptgang.backend.mapper.template;

import com.fptgang.backend.model.Report;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class ReportEmailTemplateMapper implements TemplateMapper<Report> {
    @Override
    public Map<String, Object> create(Report entity) {
        return Map.of(
                "reportId", entity.getReportId(),
                "reason", entity.getReason(),
                "status", entity.getStatus().name(),
                "createdAt", DateTimeUtil.formatDateTime(entity.getCreatedAt()),
                "reportUrl", "https://platform.com/reports/" + entity.getReportId(),
                "reporter", Map.of(
                        "firstName", entity.getReporter().getFirstName(),
                        "lastName", entity.getReporter().getLastName()
                ),
                "project", Map.of(
                        "title", entity.getProject().getTitle()
                )
        );
    }
}
