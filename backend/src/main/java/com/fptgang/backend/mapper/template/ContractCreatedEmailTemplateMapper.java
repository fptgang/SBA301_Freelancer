package com.fptgang.backend.mapper.template;

import com.fptgang.backend.model.Contract;
import com.fptgang.backend.util.CurrencyUtil;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class ContractCreatedEmailTemplateMapper implements TemplateMapper<Contract> {
    @Override
    public Map<String, Object> create(Contract entity) {
        return Map.of(
                "contractId", entity.getContractId(),
                "freelancer", Map.of(
                        "firstName", entity.getFreelancer().getFirstName(),
                        "lastName", entity.getFreelancer().getLastName(),
                        "email", entity.getFreelancer().getEmail()
                ),
                "project", Map.of(
                        "title", entity.getProject().getTitle(),
                        "client", Map.of(
                                "firstName", entity.getProject().getClient().getFirstName(),
                                "lastName", entity.getProject().getClient().getLastName(),
                                "email", entity.getProject().getClient().getEmail()
                        )
                ),
                "budget", CurrencyUtil.format(entity.getBudget()),
                "status", entity.getStatus().name(),
                "signedAt", entity.getSignedAt() != null ? DateTimeUtil.formatDateTime(entity.getSignedAt()) : null,
                "contractUrl", "https://example.com/contracts/" + entity.getContractId()
        );
    }
}
