package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.TransactionDto;
import com.fptgang.model.Transaction;

public class TransactionMapper extends BaseMapper<TransactionDto, Transaction> {
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

        return entity;
    }


    private TransactionDto.TypeEnum mapTransactionType(Transaction.TypeEnum type) {
        switch (type) {
            case DEBIT:
                return TransactionDto.TypeEnum.DEPOSIT;
            case CREDIT:
                return TransactionDto.TypeEnum.WITHDRAWAL;
            default:
                throw new IllegalArgumentException("Unexpected type value: " + type);
        }
    }

    private TransactionDto.StatusEnum mapTransactionStatus(Transaction.StatusEnum status) {
        switch (status) {
            case PENDING:
                return TransactionDto.StatusEnum.SUCCESS;
            case COMPLETED:
                return TransactionDto.StatusEnum.FAILED;
            default:
                throw new IllegalArgumentException("Unexpected status value: " + status);
        }
    }

    private Transaction.TypeEnum mapTransactionTypeReverse(TransactionDto.TypeEnum type) {
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
    private Transaction.StatusEnum mapTransactionStatusReverse(TransactionDto.StatusEnum status) {
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
