package com.fptgang.backend.mapper.template;

import com.fptgang.backend.model.Contract;
import com.fptgang.backend.util.CurrencyUtil;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class ContractSignedEmailTemplateMapper implements TemplateMapper<Contract> {
    @Override
    public Map<String, Object> create(Contract entity) {
        return Map.of(
                "freelancer", Map.of(
                        "firstName", entity.getFreelancer().getFirstName(),
                        "lastName", entity.getFreelancer().getLastName()
                ),
                "project", Map.of(
                        "title", entity.getProject().getTitle(),
                        "client", Map.of(
                                "firstName", entity.getProject().getClient().getFirstName(),
                                "lastName", entity.getProject().getClient().getLastName()
                        )
                ),
                "budget", CurrencyUtil.format(entity.getBudget()),
                "signedAt", DateTimeUtil.formatDateTime(entity.getSignedAt()),
                "contractFile", Map.of(
                        "fileUrl", entity.getContractFile().getFileUrl()
                )
        );
    }
}
