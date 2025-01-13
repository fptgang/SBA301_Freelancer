package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.TransactionDto;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.TransactionRepos;
import com.fptgang.backend.model.Proposal;
import com.fptgang.backend.model.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.Optional;

@Component
public class TransactionMapper extends BaseMapper<TransactionDto, Transaction> {


    @Autowired
    private TransactionRepos transactionRepos;

    @Autowired
    private AccountRepos accountRepos;

    @Override
    public TransactionDto toDTO(Transaction transaction) {
        if (transaction == null) {
            return null;
        }

        TransactionDto dto = new TransactionDto();
        dto.setTransactionId(transaction.getTransactionId());
        dto.setFromAccountId(transaction.getFromAccount().getAccountId()); // Mapping field name change
        dto.setToAccountId(transaction.getToAccount().getAccountId());
        dto.setAmount(transaction.getAmount().floatValue());
        dto.setType(mapTransactionType(transaction.getType())); // Convert enum type
        dto.setStatus(mapTransactionStatus(transaction.getStatus())); // Convert enum status
        dto.setCreatedAt(OffsetDateTime.from(transaction.getCreatedAt()));

        return dto;
    }

    @Override
    public Transaction toEntity(TransactionDto dto) {
        if (dto == null) {
            return null;
        }

        Optional<Transaction> existingEntityOptional = transactionRepos.findByTransactionId(dto.getTransactionId());

        if (existingEntityOptional.isPresent()) {
            Transaction existEntity = existingEntityOptional.get();
            existEntity.setFromAccount(dto.getFromAccountId() != null ? findFromToAccount(dto.getFromAccountId()) : existEntity.getFromAccount());
            existEntity.setToAccount(dto.getFromAccountId() != null ? findFromToAccount(dto.getToAccountId()) : existEntity.getToAccount());
            existEntity.setAmount(dto.getAmount() != null ? BigDecimal.valueOf(dto.getAmount()) : existEntity.getAmount());
            existEntity.setType(dto.getType() != null ? mapTransactionTypeReverse(dto.getType()) : existEntity.getType());
            existEntity.setStatus(dto.getStatus() != null ? mapTransactionStatusReverse(dto.getStatus()) : existEntity.getStatus());

            return existEntity;
        } else {
            Transaction entity = new Transaction();
            if (dto.getTransactionId() != null) {
                entity.setTransactionId(dto.getTransactionId());
            }
            if (dto.getFromAccountId() != null) {
                entity.setFromAccount(findFromToAccount(dto.getFromAccountId())); // Mapping field name change
            }
            if(dto.getToAccountId()!=null){
                entity.setToAccount(findFromToAccount(dto.getToAccountId()));
            }
            if (dto.getAmount() != null) {
                entity.setAmount(BigDecimal.valueOf(dto.getAmount().floatValue()));
            }
            if (dto.getType() != null) {
                entity.setType(mapTransactionTypeReverse(dto.getType())); // Convert enum type back
            }
            if (dto.getStatus() != null) {
                entity.setStatus(mapTransactionStatusReverse(dto.getStatus())); // Convert enum status back
            }
            if (dto.getCreatedAt() != null) {
                entity.setCreatedAt(dto.getCreatedAt().toLocalDateTime());
            }
            return  entity;
        }
    }


    public TransactionDto.TypeEnum mapTransactionType(Transaction.TransactionType type) {
        switch (type) {
            case DEPOSIT:
                return TransactionDto.TypeEnum.DEPOSIT;
            case WITHDRAWAL:
                return TransactionDto.TypeEnum.WITHDRAWAL;
            case FEE:
                return TransactionDto.TypeEnum.FEE;
            case ESCROW_DEPOSIT:
                return TransactionDto.TypeEnum.ESCROW_DEPOSIT;
            case ESCROW_RELEASE:
                return TransactionDto.TypeEnum.ESCROW_RELEASE;
            default:
                throw new IllegalArgumentException("Unexpected type value: " + type);
        }
    }

    public TransactionDto.StatusEnum mapTransactionStatus(Transaction.TransactionStatus status) {
        switch (status) {
            case SUCCESS:
                return TransactionDto.StatusEnum.SUCCESS;
            case FAILED:
                return TransactionDto.StatusEnum.FAILED;
            default:
                throw new IllegalArgumentException("Unexpected status value: " + status);
        }
    }

    public Transaction.TransactionType mapTransactionTypeReverse(TransactionDto.TypeEnum type) {
        if (type == null) {
            return null;
        }
        switch (type) {
            case DEPOSIT:
                return Transaction.TransactionType.DEPOSIT;
            case WITHDRAWAL:
                return Transaction.TransactionType.WITHDRAWAL;
            case FEE:
                return Transaction.TransactionType.FEE;
            case ESCROW_DEPOSIT:
                return Transaction.TransactionType.ESCROW_DEPOSIT;
            case ESCROW_RELEASE:
                return Transaction.TransactionType.ESCROW_RELEASE;
            default:
                throw new IllegalArgumentException("Unexpected type value: " + type);
        }
    }

    // Helper method to map status enum values in reverse
    public Transaction.TransactionStatus mapTransactionStatusReverse(TransactionDto.StatusEnum status) {
        if (status == null) {
            return null;
        }
        switch (status) {
            case SUCCESS:
                return Transaction.TransactionStatus.SUCCESS;
            case FAILED:
                return Transaction.TransactionStatus.FAILED; // Assuming FAILED -> COMPLETE
            default:
                throw new IllegalArgumentException("Unexpected status value: " + status);
        }
    }

    public Account findFromToAccount(Long id){
        Optional<Account> accountOptional = accountRepos.findByAccountId(id);
        Account account = accountOptional.get();
        return account;
    }
}
