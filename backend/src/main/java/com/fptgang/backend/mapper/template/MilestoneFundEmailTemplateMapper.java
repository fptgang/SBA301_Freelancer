package com.fptgang.backend.mapper.template;

import com.fptgang.backend.model.Milestone;
import com.fptgang.backend.util.CurrencyUtil;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class MilestoneFundEmailTemplateMapper implements TemplateMapper<Milestone> {
    @Override
    public Map<String, Object> create(Milestone milestone) {
        return Map.of(
                "freelancer", Map.of(
                        "firstName", milestone.requireFreelancer().getFirstName(),
                        "lastName", milestone.requireFreelancer().getLastName()
                ),
                "project", Map.of(
                        "title", milestone.getProject().getTitle()
                ),
                "milestone", Map.of(
                        "title", milestone.getTitle(),
                        "budgetRatio", milestone.getBudgetRatio().toString() + "%",
                        "updatedAt", DateTimeUtil.formatDateTime(milestone.getUpdatedAt())
                ),
                "projectUrl", "https://example.com/projects/" + milestone.getProject().getProjectId()
        );
    }
}
