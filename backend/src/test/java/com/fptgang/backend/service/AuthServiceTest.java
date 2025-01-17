package com.fptgang.backend.service;

import com.fptgang.backend.TestcontainersConfiguration;
import com.fptgang.backend.api.model.AuthResponseDto;
import com.fptgang.backend.api.model.RegisterRequestDto;
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
import org.springframework.context.annotation.Import;
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
@Import(TestcontainersConfiguration.class)
class AuthServiceTest {

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
        AuthResponseDto authResponse = authService.login("test@example.com", "password123");
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
