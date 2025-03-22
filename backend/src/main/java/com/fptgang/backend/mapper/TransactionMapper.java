package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.*;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.Transaction;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.MilestoneRepos;
import com.fptgang.backend.util.DateTimeUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class TransactionMapper extends BaseMapper<TransactionDto, Transaction> {
    private final AccountRepos accountRepos;
    private final AccountMapper accountMapper;
    private final MilestoneRepos milestoneRepos;
    private final MilestoneMapper milestoneMapper;

    public TransactionMapper(AccountRepos accountRepos, AccountMapper accountMapper, MilestoneRepos milestoneRepos, MilestoneMapper milestoneMapper) {
        this.accountRepos = accountRepos;
        this.accountMapper = accountMapper;
        this.milestoneRepos = milestoneRepos;
        this.milestoneMapper = milestoneMapper;
    }

    @Override
    public Transaction toEntity(TransactionDto dto) {
        if (dto == null) {
            return null;
        }

        Transaction entity = new Transaction();
        entity.setTransactionId(dto.getTransactionId());

        if (dto.getFromAccount() != null && dto.getFromAccount().getAccountId() != null) {
            entity.setFromAccount(accountRepos
                    .getReferenceById(dto.getFromAccount().getAccountId()));
        }

        if (dto.getToAccount() != null && dto.getToAccount().getAccountId() != null) {
            entity.setToAccount(accountRepos
                    .getReferenceById(dto.getToAccount().getAccountId()));
        }

        if (dto.getMilestone() != null && dto.getMilestone().getMilestoneId() != null) {
            entity.setMilestone(milestoneRepos
                    .getReferenceById(dto.getMilestone().getMilestoneId()));
        }

        entity.setNotes(dto.getNotes());
        entity.setAmount(dto.getAmount());
        entity.setType(dto.getType() == null ? null :
                Transaction.TransactionType.valueOf(dto.getType().name()));
        entity.setStatus(dto.getStatus() == null ? null :
                Transaction.TransactionStatus.valueOf(dto.getStatus().name()));
        entity.setPaymentMethod(dto.getPaymentMethod() == null ? null :
                Transaction.PaymentMethod.valueOf(dto.getPaymentMethod().name()));
        entity.setCreatedAt(DateTimeUtil.fromOffsetToLocal(dto.getCreatedAt()));
        entity.setUpdatedAt(DateTimeUtil.fromOffsetToLocal(dto.getUpdatedAt()));
        return entity;
    }

    public Transaction toEntity(DepositDto dto) {
        if (dto == null) {
            return null;
        }

        Transaction entity = new Transaction();

        if (dto.getAccountId() != null ) {
            entity.setToAccount(accountRepos
                    .getReferenceById(dto.getAccountId()));
        }

        entity.setAmount(dto.getAmount());
        entity.setType(Transaction.TransactionType.DEPOSIT);
        entity.setStatus(Transaction.TransactionStatus.PENDING);
        entity.setPaymentMethod(dto.getPaymentMethod() == null ? null :
                Transaction.PaymentMethod.valueOf(dto.getPaymentMethod().name()));
        return entity;
    }

    public Transaction toEntity(WithdrawDto dto){
        if(dto ==null){
            return  null;
        }
        Transaction entity = new Transaction();
        if(dto.getAccountEmail() != null){
            Account account = accountRepos.findByEmail(dto.getAccountEmail()).orElseThrow(null);
            entity.setFromAccount(account);
        }
        entity.setAmount(dto.getAmount());
        entity.setPaymentMethod(dto.getPaymentMethod() == null ? null :
                Transaction.PaymentMethod.valueOf(dto.getPaymentMethod()));
        entity.setNotes(dto.getNotes());
        return entity;
    }


    @Override
    public TransactionDto   toDTO(Transaction entity, DetailLevel level) {
        if (entity == null) {
            return null;
        }

        TransactionDto dto = new TransactionDto();
        dto.setTransactionId(entity.getTransactionId());
        dto.setFromAccount(accountMapper.toDTO(entity.getFromAccount(), DetailLevel.REFERENCE));
        dto.setToAccount(accountMapper.toDTO(entity.getToAccount(), DetailLevel.REFERENCE));
        dto.setMilestone(milestoneMapper.toDTO(entity.getMilestone(), DetailLevel.REFERENCE));
        dto.setAmount(entity.getAmount());
        dto.setNotes(entity.getNotes());
        dto.setType(entity.getType() == null ? null :
                TransactionTypeDto.valueOf(entity.getType().name()));
        dto.setStatus(entity.getStatus() == null ? null :
                TransactionStatusDto.valueOf(entity.getStatus().name()));
        dto.setPaymentMethod(entity.getPaymentMethod() == null ? null :
                PaymentMethodDto.valueOf(entity.getPaymentMethod().name()));
        dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));
        dto.setUpdatedAt(DateTimeUtil.fromLocalToOffset(entity.getUpdatedAt()));
            return dto;
    }

}