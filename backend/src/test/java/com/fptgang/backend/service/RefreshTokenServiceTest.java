package com.fptgang.backend.service;

import com.fptgang.backend.TestcontainersConfiguration;
import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.RefreshToken;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.RefreshTokenRepos;
import com.fptgang.backend.service.impl.RefreshTokenServiceImpl;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestConfiguration(proxyBeanMethods = false)
@Testcontainers
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@Import(TestcontainersConfiguration.class)
public class RefreshTokenServiceTest {

    @Autowired
    private RefreshTokenServiceImpl refreshTokenService;

    @Autowired
    private AccountRepos accountRepos;

    @Autowired
    private AccountService accountService;

    @Autowired
    private RefreshTokenRepos refreshTokenRepos;

    private Account testAccount;

    @BeforeEach
    void setUp() {
        // Create a mock account
        testAccount = new Account();
        testAccount.setEmail("Sender@example.com");
        testAccount.setPassword("password");
        testAccount.setRole(Role.ADMIN);
        testAccount.setVisible(true);
        testAccount.setBalance(BigDecimal.valueOf(0));
        testAccount.setVerified(false);
        testAccount.setFirstName("John");
        testAccount.setLastName("Doe");
        accountService.create(testAccount);

    }

    @AfterEach
    void tearDown() {
        refreshTokenRepos.deleteAll();
        accountRepos.deleteAll();
    }

    @Test
    @Order(1)
    void createRefreshTokenSuccess() {
        // Act
        RefreshToken createdToken = refreshTokenService.createRefreshToken(testAccount.getEmail());

        // Assert
        assertNotNull(createdToken);
        assertNotNull(createdToken.getToken());
        assertEquals(testAccount.getEmail(), createdToken.getAccount().getEmail());
        assertTrue(createdToken.getExpiryDate().isAfter(Instant.now()));
    }

    @Test
    @Order(2)
    void createRefreshTokenForNonExistentAccount() {
        // Act & Assert
        InvalidInputException exception = assertThrows(InvalidInputException.class,
                () -> refreshTokenService.createRefreshToken("unknown@example.com"));
        assertEquals("Account not found with email unknown@example.com", exception.getMessage());
    }

    @Test
    @Order(3)
    void findByAccountIdSuccess() {
        // Arrange
        RefreshToken token = refreshTokenService.createRefreshToken(testAccount.getEmail());

        // Act
        RefreshToken foundToken = refreshTokenService.findByAccountId(testAccount.getAccountId());

        // Assert
        assertNotNull(foundToken);
        assertEquals(token.getToken(), foundToken.getToken());
    }

    @Test
    @Order(4)
    void findByTokenSuccess() {
        // Arrange
        RefreshToken token = refreshTokenService.createRefreshToken(testAccount.getEmail());

        // Act
        Optional<RefreshToken> foundToken = refreshTokenService.findByToken(token.getToken());

        // Assert
        assertTrue(foundToken.isPresent());
        assertEquals(token.getToken(), foundToken.get().getToken());
    }

    @Test
    @Order(5)
    void verifyExpirationValidToken() {
        // Arrange
        RefreshToken token = refreshTokenService.createRefreshToken(testAccount.getEmail());

        // Act
        RefreshToken verifiedToken = refreshTokenService.verifyExpiration(token);

        // Assert
        assertNotNull(verifiedToken);
        assertEquals(token.getToken(), verifiedToken.getToken());
    }

    @Test
    @Order(6)
    void verifyExpirationExpiredToken() {
        // Arrange
        RefreshToken expiredToken = RefreshToken.builder()
                .account(testAccount)
                .token("expired_token")
                .expiryDate(Instant.now().minusSeconds(10)) // Expired 10 seconds ago
                .build();
        refreshTokenRepos.save(expiredToken);

        // Act
        RefreshToken verifiedToken = refreshTokenService.verifyExpiration(expiredToken);

        // Assert
        assertNull(verifiedToken);
        assertFalse(refreshTokenRepos.findByToken("expired_token").isPresent());
    }
}
