package com.fptgang.backend.service;

import com.fptgang.backend.dtos.request.RegisterRequestDTO;
import com.fptgang.backend.dtos.response.AccountResponseDTO;
import com.fptgang.backend.dtos.response.AuthResponseDTO;
import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestConfiguration(proxyBeanMethods = false)
@Testcontainers
//add orderings
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AuthServiceTest {

    @Container
    @ServiceConnection
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:latest");

    @Autowired
    private AuthService authService;

    @Autowired
    private AccountRepos accountRepos;

    @Test
    @Order(1)
    void registerValidInputAndLoginWithValidCredentials() {
        registerValidInput();
        loginValidCredentials();
    }


    void registerValidInput() {
        // Arrange
        RegisterRequestDTO registerRequestDTO = new RegisterRequestDTO();
        registerRequestDTO.setEmail("test@example.com");
        registerRequestDTO.setPassword("password123");
        registerRequestDTO.setConfirmPassword("password123");
        registerRequestDTO.setFirstName("John");
        registerRequestDTO.setLastName("Doe");

        // Act
        boolean result = authService.register(registerRequestDTO);

        // Assert
        assertTrue(result);
    }


    void loginValidCredentials() {
        // Act
        AuthResponseDTO authResponse = authService.login("test@example.com", "password123");
        // Assert
        assertEquals("test@example.com", authResponse.getAccountResponseDTO().getEmail());
        assertNotNull(authResponse.getToken());
    }


    @Test
    @Order(2)
    void registerEmailAlreadyExists() {
        // Arrange
        RegisterRequestDTO registerRequestDTO = new RegisterRequestDTO();
        registerRequestDTO.setEmail("ccc@example.com");
        registerRequestDTO.setPassword("password123");
        registerRequestDTO.setConfirmPassword("password123");
        registerRequestDTO.setFirstName("John");
        registerRequestDTO.setLastName("Doe");
        authService.register(registerRequestDTO);

        RegisterRequestDTO duplicateRegisterDTO = new RegisterRequestDTO();
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
        RegisterRequestDTO registerRequestDTO = new RegisterRequestDTO();
        registerRequestDTO.setEmail("test@example.com");
        registerRequestDTO.setPassword("password123");
        registerRequestDTO.setConfirmPassword("password321");
        registerRequestDTO.setFirstName("John");
        registerRequestDTO.setLastName("Doe");

        // Act & Assert
        assertThrows(InvalidInputException.class, () -> authService.register(registerRequestDTO));
    }


    @Test
    @Order(4)
    void loginInvalidEmail() {
        // Act & Assert
        assertThrows(InvalidInputException.class, () -> authService.login("invalid@example.com", "password123"));
    }

    @Test
    @Order(5)
    void loginInvalidPassword() {
        // Act & Assert
        assertThrows(InvalidInputException.class, () -> authService.login("test@example.com", "wrongpassword"));
    }

    @Test
    @Order(6)
    void logoutValidUser() {
        Authentication authentication = authService.getAuthentication("test@example.com");

        // Act
        boolean result = authService.logout(authentication);

        // Assert
        assertTrue(result);
    }

    @Test
    @Order(7)
    void getAuthenticationValidUser() {
        // Act
        Authentication authentication = authService.getAuthentication("test@example.com");

        // Assert
        assertNotNull(authentication);
        assertEquals("test@example.com", authentication.getName());
    }

    @Test
    @Order(8)
    void getAuthenticationInvalidUser() {
        // Act & Assert
        assertThrows(UsernameNotFoundException.class, () -> authService.getAuthentication("invalid@example.com"));
    }



}
