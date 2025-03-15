package com.fptgang.backend.mapper.template;

import com.fptgang.backend.model.Transaction;
import com.fptgang.backend.util.CurrencyUtil;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
public class TransactionDepositEmailTemplateMapper implements TemplateMapper<Transaction> {
    @Override
    public Map<String, Object> create(Transaction entity) {
        return Map.of(
                "transactionId", entity.getTransactionId(),
                "amount", CurrencyUtil.format(entity.getAmount()),
                "fromAccount", Map.of(
                        "firstName", entity.getFromAccount().getFirstName(),
                        "lastName", entity.getFromAccount().getLastName(),
                        "email", entity.getFromAccount().getEmail()
                ),
                "toAccount", Map.of(
                        "firstName", entity.getToAccount().getFirstName(),
                        "lastName", entity.getToAccount().getLastName(),
                        "email", entity.getToAccount().getEmail()
                ),
                "type", entity.getType().name(),
                "paymentMethod", entity.getPaymentMethod().name(),
                "status", entity.getStatus().name(),
                "createdAt", DateTimeUtil.formatDateTime(entity.getCreatedAt()),
                "transactionUrl", "https://yourcompany.com/transactions/" + entity.getTransactionId(),
                "supportUrl", "https://yourcompany.com/support"
        );
    }
}
