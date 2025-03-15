package com.fptgang.backend.mapper.template;

import com.fptgang.backend.model.Milestone;
import com.fptgang.backend.util.DateTimeUtil;
import com.fptgang.backend.util.CurrencyUtil;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class MilestoneCompletedEmailTemplateMapper implements TemplateMapper<Milestone> {
    @Override
    public Map<String, Object> create(Milestone entity) {
        return Map.of(
                "title", entity.getTitle(),
                "project", Map.of(
                        "title", entity.getProject().getTitle(),
                        "client", Map.of("firstName", entity.getProject().getClient().getFirstName()),
                        "contract", Map.of(
                                "freelancer", Map.of(
                                        "firstName", entity.getProject().getContract().getFreelancer().getFirstName(),
                                        "lastName", entity.getProject().getContract().getFreelancer().getLastName()
                                )
                        )
                ),
                "budgetFormatted", CurrencyUtil.format(entity.getBudgetRatio()),
                "completedAtFormatted", DateTimeUtil.formatDateTime(entity.getUpdatedAt()),
                "reviewUrl", "https://example.com/milestone/review/" + entity.getMilestoneId()
        );
    }
}