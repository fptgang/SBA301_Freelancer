package com.fptgang.backend.mapper.template;

import com.fptgang.backend.model.Milestone;
import com.fptgang.backend.util.CurrencyUtil;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class MilestoneStartedEmailTemplateMapper implements TemplateMapper<Milestone> {
    @Override
    public Map<String, Object> create(Milestone entity) {
        return Map.of(
                "title", entity.getTitle(),
                "freelancer", Map.of(
                        "firstName", entity.requireFreelancer().getFirstName()
                ),
                "project", Map.of(
                        "title", entity.getProject().getTitle(),
                        "client", Map.of(
                                "firstName", entity.getProject().getClient().getFirstName(),
                                "lastName", entity.getProject().getClient().getLastName()
                        )
                ),
                "budgetFormatted", CurrencyUtil.format(entity.getBudgetRatio()),
                "deadlineFormatted", DateTimeUtil.formatDate(entity.getDeadline()),
                "milestoneUrl", "https://platform.com/milestones/" + entity.getMilestoneId()
        );
    }
}
