package com.fptgang.backend.mapper.template;

import com.fptgang.backend.model.Milestone;
import com.fptgang.backend.util.CurrencyUtil;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class MilestoneReleasedEmailTemplateMapper implements TemplateMapper<Milestone> {
    @Override
    public Map<String, Object> create(Milestone milestone) {
        return Map.of(
                "freelancer", Map.of(
                        "firstName", milestone.getProject().getFreelancer().getFirstName()
                ),
                "milestone", Map.of(
                        "title", milestone.getTitle(),
                        "project", Map.of(
                                "title", milestone.getProject().getTitle()
                        ),
                        "budgetFormatted", CurrencyUtil.format(milestone.getBudgetRatio()),
                        "updatedAtFormatted", DateTimeUtil.formatDateTime(milestone.getUpdatedAt())
                ),
                "milestoneUrl", "https://platform.example.com/milestones/" + milestone.getMilestoneId()
        );
    }
}
