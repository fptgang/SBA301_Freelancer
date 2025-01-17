package com.fptgang.backend.service;

import com.fptgang.backend.TestcontainersConfiguration;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.model.Transaction;
import com.fptgang.backend.model.Transaction.TransactionStatus;
import com.fptgang.backend.model.Transaction.TransactionType;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.TransactionRepos;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestConfiguration(proxyBeanMethods = false)
@Testcontainers
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@Import(TestcontainersConfiguration.class)
public class TransactionServiceTest {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private TransactionRepos transactionRepos;

    @Autowired
    private AccountRepos accountRepos;

    private Account fromAccount;
    private Account toAccount;
    private Transaction testTransaction;

    @BeforeEach
    void setUp() {
        // Setup accounts
        fromAccount = new Account();
        fromAccount.setEmail("from@example.com");
        fromAccount.setPassword("password");
        fromAccount.setRole(Role.ADMIN);
        fromAccount.setVisible(true);
        fromAccount.setBalance(BigDecimal.valueOf(0));
        fromAccount.setVerified(false);
        fromAccount.setFirstName("John");
        fromAccount.setLastName("Doe");
        accountRepos.save(fromAccount);

        toAccount = new Account();
        toAccount.setEmail("to@example.com");
        toAccount.setPassword("password");
        toAccount.setRole(Role.CLIENT);
        toAccount.setVisible(true);
        toAccount.setBalance(BigDecimal.valueOf(0));
        toAccount.setVerified(false);
        toAccount.setFirstName("John");
        toAccount.setLastName("Wick");
        accountRepos.save(toAccount);

        // Setup test transaction
        testTransaction = new Transaction();
        testTransaction.setFromAccount(fromAccount);
        testTransaction.setToAccount(toAccount);
        testTransaction.setAmount(BigDecimal.valueOf(100.00));
        testTransaction.setType(TransactionType.DEPOSIT);
        testTransaction.setStatus(TransactionStatus.SUCCESS);
    }

    @AfterEach
    void tearDown() {
        transactionRepos.deleteAll();
        accountRepos.deleteAll();
    }

    @Test
    @Order(1)
    void createTransactionSuccess() {
        // Act
        Transaction createdTransaction = transactionService.create(testTransaction);

        // Assert
        assertNotNull(createdTransaction);
        assertNotNull(createdTransaction.getTransactionId());
        assertEquals(BigDecimal.valueOf(100.00), createdTransaction.getAmount());
        assertEquals(TransactionType.DEPOSIT, createdTransaction.getType());
    }

    @Test
    @Order(2)
    void updateTransactionSuccess() {
        // Arrange
        Transaction savedTransaction = transactionService.create(testTransaction);
        savedTransaction.setAmount(BigDecimal.valueOf(200.00));
        savedTransaction.setStatus(TransactionStatus.FAILED);

        // Act
        Transaction updatedTransaction = transactionService.update(savedTransaction);

        // Assert
        assertEquals(BigDecimal.valueOf(200.00), updatedTransaction.getAmount());
        assertEquals(TransactionStatus.FAILED, updatedTransaction.getStatus());
    }

    @Test
    @Order(3)
    void findByIdSuccess() {
        // Arrange
        Transaction savedTransaction = transactionService.create(testTransaction);

        // Act
        Transaction foundTransaction = transactionService.findById(savedTransaction.getTransactionId());

        // Assert
        assertNotNull(foundTransaction);
        assertEquals(savedTransaction.getTransactionId(), foundTransaction.getTransactionId());
    }

    @Test
    @Order(4)
    void findByIdNotFound() {
        // Act & Assert
        assertNull(transactionService.findById(999L));
    }

    @Test
    @Order(5)
    void getAllTransactions() {
        // Arrange
        for (int i = 1; i <= 3; i++) {
            Transaction transaction = new Transaction();
            transaction.setFromAccount(fromAccount);
            transaction.setToAccount(toAccount);
            transaction.setAmount(BigDecimal.valueOf(50.00 * i));
            transaction.setType(TransactionType.WITHDRAWAL);
            transaction.setStatus(TransactionStatus.SUCCESS);
            transactionService.create(transaction);
        }

        Pageable pageable = PageRequest.of(0, 10);

        // Act
        Page<Transaction> transactions = transactionService.getAll(pageable, null);

        // Assert
        assertNotNull(transactions);
        assertEquals(3, transactions.getTotalElements());
    }

    @Test
    @Order(6)
    void getTransactionsByAmountRange() {
        // Arrange
        for (int i = 1; i <= 3; i++) {
            Transaction transaction = new Transaction();
            transaction.setFromAccount(fromAccount);
            transaction.setToAccount(toAccount);
            transaction.setAmount(BigDecimal.valueOf(50.00 * i));
            transaction.setType(TransactionType.DEPOSIT);
            transaction.setStatus(TransactionStatus.SUCCESS);
            transactionService.create(transaction);
        }

        Pageable pageable = PageRequest.of(0, 10);

        // Act
        Page<Transaction> transactions = transactionService.getAll(pageable, BigDecimal.valueOf(50.00), BigDecimal.valueOf(150.00));

        // Assert
        assertNotNull(transactions);
        assertEquals(3, transactions.getTotalElements());
    }

    @Test
    @Order(7)
    void updateNonExistingTransaction() {
        // Arrange
        testTransaction.setTransactionId(999L);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> transactionService.update(testTransaction));
    }
}
