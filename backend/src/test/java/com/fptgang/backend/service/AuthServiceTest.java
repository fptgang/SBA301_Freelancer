package com.fptgang.backend.service;

import com.fptgang.backend.TestcontainersConfiguration;
import com.fptgang.backend.api.model.AuthResponseDto;
import com.fptgang.backend.api.model.RegisterRequestDto;
import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.util.Fingerprint;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestConfiguration(proxyBeanMethods = false)
@Testcontainers
//add orderings
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@Import(TestcontainersConfiguration.class)
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private AccountRepos accountRepos;

    private static Fingerprint fingerprint;

    @BeforeAll
    static void beforeAll() {
        fingerprint = Fingerprint.builder()
                .sessionId("292dc572-34b3-4b77-b64d-de8929645c49")
                .ipAddress("127.0.0.1")
                .clientInfo("Test")
                .build();
    }

    @Test
    @Order(1)
    void registerValidInputAndLoginWithValidCredentials() {
        registerValidInput();
        loginValidCredentials();
    }


    void registerValidInput() {
        // Arrange
        RegisterRequestDto RegisterRequestDto = new RegisterRequestDto();
        RegisterRequestDto.setEmail("test@example.com");
        RegisterRequestDto.setPassword("password123");
        RegisterRequestDto.setConfirmPassword("password123");
        RegisterRequestDto.setFirstName("John");
        RegisterRequestDto.setLastName("Doe");

        // Act
        boolean result = authService.register(RegisterRequestDto);

        // Assert
        assertTrue(result);
    }


    void loginValidCredentials() {
        // Act
        AuthResponseDto authResponse = authService.login("test@example.com", "password123", fingerprint);
        // Assert
        assertEquals("test@example.com", authResponse.getAccountResponseDTO().getEmail());
        assertNotNull(authResponse.getToken());
    }


    @Test
    @Order(2)
    void registerEmailAlreadyExists() {
        // Arrange
        RegisterRequestDto RegisterRequestDto = new RegisterRequestDto();
        RegisterRequestDto.setEmail("ccc@example.com");
        RegisterRequestDto.setPassword("password123");
        RegisterRequestDto.setConfirmPassword("password123");
        RegisterRequestDto.setFirstName("John");
        RegisterRequestDto.setLastName("Doe");
        authService.register(RegisterRequestDto);

        RegisterRequestDto duplicateRegisterDTO = new RegisterRequestDto();
        duplicateRegisterDTO.setEmail("ccc@example.com");
        duplicateRegisterDTO.setPassword("password123");
        duplicateRegisterDTO.setConfirmPassword("password123");
        duplicateRegisterDTO.setFirstName("Jane");
        duplicateRegisterDTO.setLastName("Smith");

        // Act & Assert
        assertThrows(InvalidInputException.class, () -> authService.register(duplicateRegisterDTO));
    }

    @Test
    @Order(3)
    void registerPasswordMismatch() {
        // Arrange
        RegisterRequestDto RegisterRequestDto = new RegisterRequestDto();
        RegisterRequestDto.setEmail("test@example.com");
        RegisterRequestDto.setPassword("password123");
        RegisterRequestDto.setConfirmPassword("password321");
        RegisterRequestDto.setFirstName("John");
        RegisterRequestDto.setLastName("Doe");

        // Act & Assert
        assertThrows(InvalidInputException.class, () -> authService.register(RegisterRequestDto));
    }


    @Test
    @Order(4)
    void loginInvalidEmail() {
        // Act & Assert
        assertThrows(InvalidInputException.class, () -> authService.login("invalid@example.com", "password123", fingerprint));
    }

    @Test
    @Order(5)
    void loginInvalidPassword() {
        // Act & Assert
        assertThrows(InvalidInputException.class, () -> authService.login("test@example.com", "wrongpassword", fingerprint));
    }

    @Test
    @Order(6)
    void logoutValidUser() {
        // Act
        boolean result = authService.logout("test@example.com", fingerprint);

        // Assert
        assertTrue(result);
    }



}
