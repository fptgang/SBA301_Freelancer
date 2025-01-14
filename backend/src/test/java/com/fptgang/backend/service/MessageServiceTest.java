package com.fptgang.backend.service;


import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.Message;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.MessageRepos;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestConfiguration(proxyBeanMethods = false)
@Testcontainers
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class MessageServiceTest {
    @Container
    @ServiceConnection
    static MySQLContainer<?> mysql = new MySQLContainer<>(DockerImageName.parse("mysql:latest"));

    @Autowired
    private MessageService messageService;

    @Autowired
    private AccountService accountService;

    @Autowired
    private MessageRepos messageRepos;

    @Autowired
    private AccountRepos accountRepos;

    private Message testMessage;

    private Account receiver;

    private Account sender;


    @BeforeEach
    void setUp() {
        // Create mock accounts
        sender = new Account();
        sender.setEmail("Sender@example.com");
        sender.setPassword("password");
        sender.setRole(Role.ADMIN);
        sender.setVisible(true);
        sender.setBalance(BigDecimal.valueOf(0));
        sender.setVerified(false);
        sender.setFirstName("John");
        sender.setLastName("Doe");
        accountService.create(sender);

        receiver = new Account();
        receiver.setEmail("Receiver@example.com");
        receiver.setPassword("password");
        receiver.setRole(Role.CLIENT);
        receiver.setVisible(true);
        receiver.setBalance(BigDecimal.valueOf(0));
        receiver.setVerified(false);
        receiver.setFirstName("John");
        receiver.setLastName("Wick");
        accountService.create(receiver);


        // Create test message
        testMessage = new Message();
        testMessage.setSender(sender);
        testMessage.setReceiver(receiver);
        testMessage.setContent("Test Message Content");
        testMessage.setCreatedAt(LocalDateTime.now());
        testMessage.setVisible(true);
    }

    @AfterEach
    void tearDown() {
        messageRepos.deleteAll();
        accountRepos.deleteAll();
    }

    @Test
    @Order(1)
    void createMessageSuccess() {
        // Act
        Message createdMessage = messageService.create(testMessage);

        // Assert
        assertNotNull(createdMessage);
        assertNotNull(createdMessage.getMessageId());
        assertEquals("Test Message Content", createdMessage.getContent());
        assertTrue(createdMessage.isVisible());
    }

    @Test
    @Order(2)
    void updateMessageSuccess() {
        // Arrange
        Message savedMessage = messageService.create(testMessage);
        savedMessage.setContent("Updated Content");

        // Act
        Message updatedMessage = messageService.update(savedMessage);

        // Assert
        assertEquals("Updated Content", updatedMessage.getContent());
    }

    @Test
    @Order(3)
    void findByMessageIdSuccess() {
        // Arrange
        Message savedMessage = messageService.create(testMessage);

        // Act
        Message foundMessage = messageService.findByMessageId(savedMessage.getMessageId());

        // Assert
        assertNotNull(foundMessage);
        assertEquals(savedMessage.getMessageId(), foundMessage.getMessageId());
    }

    @Test
    @Order(4)
    void findByMessageIdNotFound() {
        // Act & Assert
        assertThrows(InvalidInputException.class, () -> messageService.findByMessageId(999L));
    }

    @Test
    @Order(5)
    void deleteByIdSuccess() {
        // Arrange
        Message savedMessage = messageService.create(testMessage);

        // Act
        messageService.deleteById(savedMessage.getMessageId());

        Message updatedMessage = messageService.findByMessageId(savedMessage.getMessageId());

        // Assert
        assertFalse(updatedMessage.isVisible());
    }

    @Test
    @Order(6)
    void getAllMessagesNoFilter() {
        // Arrange
        for (int i = 0; i < 3; i++) {
            Message message = new Message();
            message.setSender(testMessage.getSender());
            message.setReceiver(testMessage.getReceiver());
            message.setContent("Message " + i);
            messageService.create(message);
        }

        Pageable pageable = PageRequest.of(0,10);

        // Act
        Page<Message> messagePage = messageService.getAll(pageable, null);

        // Assert
        assertNotNull(messagePage);
        assertTrue(messagePage.getTotalElements() >= 3);
    }

    @Test
    @Order(7)
    void createMessageWithNullSender() {
        // Arrange
        testMessage.setSender(null);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> messageService.create(testMessage));
    }
}