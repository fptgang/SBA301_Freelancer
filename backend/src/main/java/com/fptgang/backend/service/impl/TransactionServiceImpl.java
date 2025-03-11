package com.fptgang.backend.service.impl;

import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.Milestone;
import com.fptgang.backend.model.Transaction;
import com.fptgang.backend.repository.TransactionRepos;
import com.fptgang.backend.service.AccountService;
import com.fptgang.backend.service.TransactionService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.EntityUtil;
import com.google.common.base.Preconditions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepos transactionRepos;
    private final AccountService accountService;

    @Autowired
    public TransactionServiceImpl(TransactionRepos transactionRepos, AccountService accountService) {
        this.transactionRepos = transactionRepos;
        this.accountService = accountService;
    }

    public Transaction create(Transaction transaction) {
        if (transaction.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidInputException("Amount must be greater than 0");
        }

        var from = transaction.getFromAccount();
        var to = transaction.getToAccount();

        switch (transaction.getType()) {
            case DEPOSIT:
                Preconditions.checkArgument(from == null && to != null,
                        "Transaction must have NO from and to account");
                break;
            case WITHDRAWAL:
                Preconditions.checkArgument(from != null && to == null,
                        "Transaction must have from and NO to account");
                break;
            default:
                Preconditions.checkArgument(from != null && to != null,
                        "Transaction must have both from and to account");
                break;
        }

        if (from != null) {
            if (from.getBalance().compareTo(transaction.getAmount()) < 0) {
                throw new IllegalArgumentException("Insufficient balance");
            }
            from.setBalance(from.getBalance().subtract(transaction.getAmount()));
            from = accountService.update(from);
        }

        if (to != null) {
            to.setBalance(to.getBalance().add(transaction.getAmount()));
            to = accountService.update(to);
        }

        transaction.setFromAccount(from);
        transaction.setToAccount(to);
        return transactionRepos.save(transaction);
    }

    @Override
    @Transactional
    public synchronized Transaction createEscrowDeposit(Milestone milestone) {
        if (existByMilestone(Transaction.TransactionType.ESCROW_DEPOSIT,
                Transaction.TransactionStatus.SUCCESS,
                milestone.getMilestoneId())) {
            throw new IllegalArgumentException("Escrow deposit already exists on milestone");
        }
        var from = milestone.getProject().getClient();
        var to = accountService.getEscrowAccountReference();
        var fund = milestone.getProject().getContract()
                .getBudget().multiply(milestone.getBudgetRatio());
        return create(Transaction.builder()
                .fromAccount(from)
                .toAccount(to)
                .milestone(milestone)
                .amount(fund)
                .type(Transaction.TransactionType.ESCROW_DEPOSIT)
                .status(Transaction.TransactionStatus.SUCCESS)
                .paymentMethod(Transaction.PaymentMethod.INTERNAL_WALLET)
                .build());
    }

    @Override
    @Transactional
    public synchronized Transaction createEscrowRelease(Milestone milestone) {
        if (existByMilestone(Transaction.TransactionType.ESCROW_RELEASE,
                Transaction.TransactionStatus.SUCCESS,
                milestone.getMilestoneId())) {
            throw new IllegalArgumentException("Escrow deposit already exists on milestone");
        }
        var from = accountService.getEscrowAccountReference();
        var to = milestone.getProject().getContract().getFreelancer();
        var fund = milestone.getProject().getContract()
                .getBudget().multiply(milestone.getBudgetRatio());
        return create(Transaction.builder()
                .fromAccount(from)
                .toAccount(to)
                .milestone(milestone)
                .amount(fund)
                .type(Transaction.TransactionType.ESCROW_RELEASE)
                .status(Transaction.TransactionStatus.SUCCESS)
                .paymentMethod(Transaction.PaymentMethod.INTERNAL_WALLET)
                .build());
    }

    @Override
    @Transactional
    public synchronized Transaction createEscrowRefund(Milestone milestone) {
        if (existByMilestone(Transaction.TransactionType.ESCROW_REFUND,
                Transaction.TransactionStatus.SUCCESS,
                milestone.getMilestoneId())) {
            throw new IllegalArgumentException("Escrow deposit already exists on milestone");
        }
        var from = accountService.getEscrowAccountReference();
        var to = milestone.getProject().getClient();
        var fund = milestone.getProject().getContract()
                .getBudget().multiply(milestone.getBudgetRatio());
        return create(Transaction.builder()
                .fromAccount(from)
                .toAccount(to)
                .milestone(milestone)
                .amount(fund)
                .type(Transaction.TransactionType.ESCROW_REFUND)
                .status(Transaction.TransactionStatus.SUCCESS)
                .paymentMethod(Transaction.PaymentMethod.INTERNAL_WALLET)
                .build());
    }

    @Override
    public Transaction findById(long id) {
        return transactionRepos.findById(id).orElse(null);
    }

    @Override
    public Transaction findByMilestone(Transaction.TransactionType type, Transaction.TransactionStatus status, Long milestoneId) {
        return transactionRepos.findByTypeAndStatusAndMilestone_MilestoneId(type, status, milestoneId).orElse(null);
    }

    @Override
    public boolean existByMilestone(Transaction.TransactionType type, Transaction.TransactionStatus status, Long milestoneId) {
        return transactionRepos.existsByTypeAndStatusAndMilestone_MilestoneId(type, status, milestoneId);
    }

    @Override
    public synchronized Transaction update(Transaction transaction) {
        Transaction existing = transactionRepos.findById(transaction.getTransactionId())
                .orElseThrow(() -> new InvalidInputException("Transaction does not exist"));
        EntityUtil.merge(existing, transaction);
        return transactionRepos.save(existing);
    }

    @Override
    public Page<Transaction> getAll(ListParams params) {
        var spec = params.<Transaction>toSpec();
        return transactionRepos.findAll(spec, params.getPageable());
    }
}