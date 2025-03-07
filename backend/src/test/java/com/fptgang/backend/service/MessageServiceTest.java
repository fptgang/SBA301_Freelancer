package com.fptgang.backend.service;


import com.fptgang.backend.TestcontainersConfiguration;
import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.*;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.MessageRepos;
import com.fptgang.backend.repository.ProjectCategoryRepos;
import com.fptgang.backend.repository.ProjectRepos;
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
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@Slf4j
@SpringBootTest
@TestConfiguration(proxyBeanMethods = false)
@Testcontainers
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@Import(TestcontainersConfiguration.class)
public class MessageServiceTest {

    @Autowired
    private MessageService messageService;

    @Autowired
    private AccountService accountService;

    @Autowired
    private MessageRepos messageRepos;

    @Autowired
    private AccountRepos accountRepos;

    @Autowired
    private ProjectService projectService;

    private Message testMessage;

    private Project project;

    private Account sender;
    @Autowired
    private ProjectCategoryRepos projectCategoryRepos;
    @Autowired
    private ProjectRepos projectRepos;

    Account createTestAccount(int id) {
        Account account = new Account();
        account.setEmail("MessageTest"+id+"@example.com");
        account.setPassword("password");
        account.setIsVisible(true);
        account.setBalance(BigDecimal.valueOf(0));
        account.setIsVerified(false);
        account.setRole(Role.CLIENT);
        account.setFirstName("John");
        account.setLastName("Doe");
        return accountService.create(account);
    }

    Project createTestProject(int id){
        Account employer = createTestAccount(id+1);
        // First create and save the category
        ProjectCategory testCategory = new ProjectCategory();
        testCategory.setName("Test Category");
        testCategory.setIsVisible(true);
        testCategory = projectCategoryRepos.save(testCategory);

        // Then create the project with the saved category
        Project testProject = new Project();
        testProject.setTitle("Test Project");
        testProject.setDescription("Test Description");
        testProject.setCategory(testCategory);
        testProject.setClient(employer);
        testProject.setStatus(Project.ProjectStatus.OPEN);
        testProject.setIsVisible(true);

        return projectService.create(testProject);
        // Set other necessary fields
    }

    @BeforeEach
    void setUp() {
        // Create mock accounts
//        sender = createTestAccount(0);

        project = createTestProject(1);

        sender = project.getClient();

        // Create test message
        testMessage = new Message();
        testMessage.setSender(sender);
        testMessage.setProject(project);
        testMessage.setContent("Test Message Content");
        testMessage.setCreatedAt(LocalDateTime.now());
        testMessage.setIsVisible(true);
    }

    @AfterEach
    void tearDown() {
        messageRepos.deleteAll();
        projectRepos.deleteAll();
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
        assertTrue(createdMessage.getIsVisible());
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
        assertFalse(updatedMessage.getIsVisible());
    }

    @Test
    @Order(6)
    void getAllMessagesNoFilter() {
        // Arrange
        for (int i = 0; i < 3; i++) {
            Message message = new Message();
            message.setSender(testMessage.getSender());
            message.setProject(testMessage.getProject());
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

    @Test
    @Order(10)
    void getAllMessagesWithFilter() {
        var testMessage = new Message();
        testMessage.setSender(sender);
        testMessage.setProject(project);
        testMessage.setContent("Test Message Content");
        testMessage.setCreatedAt(LocalDateTime.now());
        testMessage.setIsVisible(true);
        messageService.create(testMessage);
        var testMessage2 = new Message();
        testMessage2.setSender(sender);
        testMessage2.setProject(project);
        testMessage2.setContent("unfiltered Message Content");
        testMessage2.setCreatedAt(LocalDateTime.now());
        testMessage2.setIsVisible(true);
        messageService.create(testMessage2);
        Pageable pageable = PageRequest.of(0, 10);
        Page<Message> messagePage = messageService.getAll(pageable, "content,startswith,Test");
        assertTrue(messagePage.getTotalElements() == 1);
    }
}