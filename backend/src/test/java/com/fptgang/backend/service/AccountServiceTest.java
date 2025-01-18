package com.fptgang.backend.service;

import com.fptgang.backend.TestcontainersConfiguration;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.repository.AccountRepos;
import lombok.extern.slf4j.Slf4j;
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

@Slf4j
@SpringBootTest
@TestConfiguration(proxyBeanMethods = false)
@Testcontainers
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@Import(TestcontainersConfiguration.class)
class AccountServiceTest {

    @Autowired
    private AccountService accountService;
    @Autowired
    private AccountRepos accountRepos;

    @AfterEach
    void tearDown() {
        accountRepos.deleteAll();
    }

    Account createTestAccount(Integer accountId) {
        Account account = new Account();
        account.setEmail("testAccount"+accountId+"@example.com");
        account.setPassword("password");
        account.setVisible(true);
        account.setBalance(BigDecimal.valueOf(0));
        account.setVerified(false);
        account.setRole(Role.CLIENT);
        account.setFirstName("John");
        account.setLastName("Doe");
        return accountService.create(account);
    }

    Account createTestAccount(){
        Account account = new Account();
        account.setEmail("test@example.com");
        account.setPassword("password");
        account.setVisible(true);
        account.setBalance(BigDecimal.valueOf(0));
        account.setVerified(false);
        account.setRole(Role.CLIENT);
        account.setFirstName("John");
        account.setLastName("Doe");
        return accountService.create(account);
    }

    @Test
    @Order(1)
    void createAccountSuccessfully() {
        Account account = createTestAccount();

        assertNotNull(account);
        assertEquals("test@example.com", account.getEmail());
    }

    @Test
    @Order(2)
    void createAccountWithExistingEmail() {
        createTestAccount();
        assertThrows(RuntimeException.class, () -> createTestAccount());
    }

    @Test
    @Order(3)
    void findAccountByIdSuccessfully() {
        Account account = createTestAccount();

        Account foundAccount = accountService.findById(account.getAccountId());

        assertNotNull(foundAccount);
        assertEquals(account.getAccountId(), foundAccount.getAccountId());
    }

    @Test
    @Order(4)
    void findAccountByIdNotFound() {
        assertNull(accountService.findById(999L));
    }

    @Test
    @Order(5)
    void findAccountByEmailSuccessfully() {
        Account account = createTestAccount();
        Account foundAccount = accountService.findByEmail(account.getEmail());
        assertNotNull(foundAccount);
        assertEquals("test@example.com", foundAccount.getEmail());
    }

    @Test
    @Order(6)
    void findAccountByEmailNotFound() {
        assertNull(accountService.findByEmail("nonexistent@example.com"));
    }

    @Test
    @Order(7)
    void updateAccountSuccessfully() {
        Account account = createTestAccount();
        account.setPassword("newpassword");

        Account updatedAccount = accountService.update(account);

        assertNotNull(updatedAccount);
        assertEquals("newpassword", updatedAccount.getPassword());
    }

    @Test
    @Order(8)
    void updateAccountNotFound() {
        Account account = new Account();
        account.setAccountId(999L);
        account.setEmail("test@example.com");
        account.setPassword("password");
        account.setVisible(true);
        account.setBalance(BigDecimal.valueOf(0));
        account.setVerified(false);
        account.setRole(Role.CLIENT);
        account.setFirstName("John");
        account.setLastName("Doe");

        assertThrows(RuntimeException.class, () -> accountService.update(account));
    }

    @Test
    @Order(9)
    void deleteAccountByIdSuccessfully() {
        Account account = createTestAccount();

        accountService.deleteById(account.getAccountId());

        assertFalse(accountService.findById(account.getAccountId()).isVisible());
    }

    @Test
    @Order(10)
    void deleteAccountByIdNotFound() {
        assertThrows(RuntimeException.class, () -> accountService.deleteById(999L));
    }

    @Test
    @Order(11)
    void getAllAccountsSuccessfully() {
        Account account1 = createTestAccount(1);

        Account account2 = createTestAccount(2);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Account> accountsPage = accountService.getAll(pageable,null);

        assertTrue(accountsPage.getTotalElements() >= 2);
    }

    @Test
    @Order(12)
    void getAllAccountsWithFilter() {
        Account account1 = createTestAccount(1);

        Account account2 = createTestAccount(2);

        Account account3 = createTestAccount(3);


        Account account4 = new Account();
        account4.setEmail("filtered@example.com");
        account4.setPassword("password");
        account4.setVisible(true);
        account4.setBalance(BigDecimal.valueOf(0));
        account4.setVerified(false);
        account4.setRole(Role.CLIENT);
        account4.setFirstName("John");
        account4.setLastName("Doe");
        accountService.create(account4);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Account> accountsPage = accountService.getAll(pageable, "email,contains,filtered");
        for(Account account : accountsPage.getContent()){
            log.info(account.getEmail());
        }
        assertTrue(accountsPage.getTotalElements() ==1);
    }
}