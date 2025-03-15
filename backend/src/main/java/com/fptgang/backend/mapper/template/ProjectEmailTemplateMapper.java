package com.fptgang.backend.mapper.template;

import com.fptgang.backend.model.Project;
import com.fptgang.backend.util.CurrencyUtil;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class ProjectEmailTemplateMapper implements TemplateMapper<Project> {
    @Override
    public Map<String, Object> create(Project project) {
        return Map.of(
                "projectStatus", project.getStatus().name(),
                "title", project.getTitle(),
                "client", Map.of("firstName", project.getClient().getFirstName()),
                "minBudget", CurrencyUtil.format(project.getMinBudget()),
                "maxBudget", CurrencyUtil.format(project.getMaxBudget()),
                "startDate", DateTimeUtil.formatDate(project.getStartDate()),
                "terminationReason", project.getTerminationReason() != null ? project.getTerminationReason().name() : null,
                "projectLink", "https://example.com/project/" + project.getProjectId()
        );
    }
}