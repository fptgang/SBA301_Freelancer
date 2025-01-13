package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.TransactionDto;
import com.fptgang.backend.repository.TransactionRepos;
import com.fptgang.model.Proposal;
import com.fptgang.model.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.Optional;

@Component
public class TransactionMapper extends BaseMapper<TransactionDto, Transaction> {


    @Autowired
    private TransactionRepos transactionRepos;

    @Override
    TransactionDto toDTO(Transaction transaction) {
        if (transaction == null) {
            return null;
        }

        TransactionDto dto = new TransactionDto();
        dto.setTransactionId(transaction.getTransactionId());
        dto.setFromAccountId(transaction.getAccountId()); // Mapping field name change
        dto.setAmount(transaction.getAmount());
        dto.setType(mapTransactionType(transaction.getType())); // Convert enum type
        dto.setStatus(mapTransactionStatus(transaction.getStatus())); // Convert enum status
        dto.setCreatedAt(transaction.getCreatedAt());

        return dto;
    }

    @Override
    Transaction toEntity(TransactionDto dto) {
        if (dto == null) {
            return null;
        }

        Optional<Transaction> existingEntityOptional = transactionRepos.findByTransactionId(dto.getTransactionId());
        if (existingEntityOptional.isPresent()) {
            Transaction existEntity = existingEntityOptional.get();
            existEntity.setAccountId(dto.getFromAccountId() != null ? dto. getFromAccountId() : existEntity.getAccountId());
            existEntity.setAmount(dto.getAmount() != null ? dto.getAmount() : existEntity.getAmount());
            existEntity.setType(dto.getType() != null ? mapTransactionTypeReverse(dto.getType()) : existEntity.getType());
            existEntity.setStatus(dto.getStatus() != null ? mapTransactionStatusReverse(dto.getStatus()) : existEntity.getStatus());

            return existEntity;
        } else {
            Transaction entity = new Transaction();
            if (dto.getTransactionId() != null) {
                entity.setTransactionId(dto.getTransactionId());
            }
            if (dto.getFromAccountId() != null) {
                entity.setAccountId(dto.getFromAccountId()); // Mapping field name change
            }
            if (dto.getAmount() != null) {
                entity.setAmount(dto.getAmount());
            }
            if (dto.getType() != null) {
                entity.setType(mapTransactionTypeReverse(dto.getType())); // Convert enum type back
            }
            if (dto.getStatus() != null) {
                entity.setStatus(mapTransactionStatusReverse(dto.getStatus())); // Convert enum status back
            }
            if (dto.getCreatedAt() != null) {
                entity.setCreatedAt(dto.getCreatedAt());
            }
            return  entity;
        }
    }


    public TransactionDto.TypeEnum mapTransactionType(Transaction.TypeEnum type) {
        switch (type) {
            case DEBIT:
                return TransactionDto.TypeEnum.DEPOSIT;
            case CREDIT:
                return TransactionDto.TypeEnum.WITHDRAWAL;
            default:
                throw new IllegalArgumentException("Unexpected type value: " + type);
        }
    }

    public TransactionDto.StatusEnum mapTransactionStatus(Transaction.StatusEnum status) {
        switch (status) {
            case PENDING:
                return TransactionDto.StatusEnum.SUCCESS;
            case COMPLETED:
                return TransactionDto.StatusEnum.FAILED;
            default:
                throw new IllegalArgumentException("Unexpected status value: " + status);
        }
    }

    public Transaction.TypeEnum mapTransactionTypeReverse(TransactionDto.TypeEnum type) {
        if (type == null) {
            return null;
        }
        switch (type) {
            case DEPOSIT:
                return Transaction.TypeEnum.DEBIT; // Assuming DEPOSIT -> DEBIT
            case WITHDRAWAL:
                return Transaction.TypeEnum.CREDIT; // Assuming WITHDRAWAL -> CREDIT
            default:
                throw new IllegalArgumentException("Unexpected type value: " + type);
        }
    }

    // Helper method to map status enum values in reverse
    public Transaction.StatusEnum mapTransactionStatusReverse(TransactionDto.StatusEnum status) {
        if (status == null) {
            return null;
        }
        switch (status) {
            case SUCCESS:
                return Transaction.StatusEnum.PENDING; // Assuming SUCCESS -> PENDING
            case FAILED:
                return Transaction.StatusEnum.COMPLETED; // Assuming FAILED -> COMPLETED
            default:
                throw new IllegalArgumentException("Unexpected status value: " + status);
        }
    }
}
