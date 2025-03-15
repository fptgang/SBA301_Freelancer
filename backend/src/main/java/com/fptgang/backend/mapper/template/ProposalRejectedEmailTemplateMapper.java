package com.fptgang.backend.mapper.template;

import com.fptgang.backend.model.Proposal;
import com.fptgang.backend.util.CurrencyUtil;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class ProposalRejectedEmailTemplateMapper implements TemplateMapper<Proposal> {
    @Override
    public Map<String, Object> create(Proposal proposal) {
        return Map.of(
                "freelancer", Map.of(
                        "firstName", proposal.getFreelancer().getFirstName()
                ),
                "project", Map.of(
                        "title", proposal.getProject().getTitle(),
                        "client", Map.of(
                                "firstName", proposal.getProject().getClient().getFirstName(),
                                "lastName", proposal.getProject().getClient().getLastName()
                        )
                ),
                "budget", CurrencyUtil.format(proposal.getBudget()),
                "createdAt", DateTimeUtil.formatDate(proposal.getCreatedAt()),
                "exploreProjectsUrl", "https://yourplatform.com/projects"
        );
    }
}
