package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.TransactionDto;
import com.fptgang.backend.model.Transaction;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.MilestoneRepos;
import com.fptgang.backend.repository.TransactionRepos;
import com.fptgang.backend.util.DateTimeUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@Component
public class TransactionMapper extends BaseMapper<TransactionDto, Transaction> {
    private final TransactionRepos transactionRepos;
    private final AccountRepos accountRepos;
    private final MilestoneRepos milestoneRepos;

    public TransactionMapper(TransactionRepos transactionRepos, AccountRepos accountRepos, MilestoneRepos milestoneRepos) {
        this.transactionRepos = transactionRepos;
        this.accountRepos = accountRepos;
        this.milestoneRepos = milestoneRepos;
    }

    @Override
    public Transaction toEntity(TransactionDto dto) {
        if (dto == null) {
            return null;
        }

        Transaction entity = new Transaction();
        entity.setTransactionId(dto.getTransactionId());

        if (dto.getFromAccountId() != null) {
            entity.setFromAccount(accountRepos.findByAccountId(dto.getFromAccountId())
                    .orElseThrow(() -> new IllegalArgumentException("From account not found")));
        }

        if (dto.getToAccountId() != null) {
            entity.setToAccount(accountRepos.findByAccountId(dto.getToAccountId())
                    .orElseThrow(() -> new IllegalArgumentException("To account not found")));
        }

        entity.setAmount(dto.getAmount());
        entity.setType(Transaction.TransactionType.valueOf(dto.getType().name()));
        entity.setStatus(Transaction.TransactionStatus.valueOf(dto.getStatus().name()));
        entity.setPaymentMethod(Transaction.PaymentMethod.valueOf(dto.getPaymentMethod().name()));
        entity.setCreatedAt(DateTimeUtil.fromOffsetToLocal(dto.getCreatedAt()));
        entity.setMilestone(milestoneRepos.findById(dto.getMilestoneId()).orElse(null));
        return entity;
    }

    @Override
    public TransactionDto toDTO(Transaction entity, DetailLevel level) {
        if (entity == null) {
            return null;
        }

        TransactionDto dto = new TransactionDto();
        dto.setTransactionId(entity.getTransactionId());
        dto.setFromAccountId(entity.getFromAccount().getAccountId());
        dto.setToAccountId(entity.getToAccount().getAccountId());
        dto.setAmount(entity.getAmount());
        dto.setType(TransactionDto.TypeEnum.valueOf(entity.getType().name()));
        dto.setStatus(TransactionDto.StatusEnum.valueOf(entity.getStatus().name()));
        dto.setPaymentMethod(entity.getPaymentMethod()!=null?TransactionDto.PaymentMethodEnum.valueOf(entity.getPaymentMethod().name()):null);
        dto.setMilestoneId(entity.getMilestone() != null ? entity.getMilestone().getMilestoneId() : null);
        dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));

        if (level == DetailLevel.REFERENCE) {
            return dto; // those fields are enough
        }

        if (level == DetailLevel.SUMMARY) {
            return dto; // those fields are enough
        }

        // Add more fields if needed for other detail levels

        return dto;
    }

}