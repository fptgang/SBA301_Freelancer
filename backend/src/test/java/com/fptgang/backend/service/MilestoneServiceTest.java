package com.fptgang.backend.service;

import com.fptgang.backend.model.*;
import com.fptgang.backend.repository.*;
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
class MilestoneServiceTest {

    @Container
    @ServiceConnection
    static MySQLContainer<?> mysql = new MySQLContainer<>(DockerImageName.parse("mysql:latest"));

    private final MilestoneService milestoneService;
    private final MilestoneRepos milestoneRepos;
    private final AccountService accountService;
    private final AccountRepos accountRepos;
    private final ProjectCategoryRepos projectCategoryRepos;
    private final ProjectService projectService;
    private final ProjectRepos projectRepos;

    @Autowired
    public MilestoneServiceTest(MilestoneService milestoneService, MilestoneRepos milestoneRepos, AccountService accountService, AccountRepos accountRepos, ProjectCategoryRepos projectCategoryRepos, ProjectCategoryRepos projectCategoryRepos1, ProjectService projectService, ProjectRepos projectRepos) {
        this.milestoneService = milestoneService;
        this.milestoneRepos = milestoneRepos;
        this.accountService = accountService;
        this.accountRepos = accountRepos;
        this.projectCategoryRepos = projectCategoryRepos1;
        this.projectService = projectService;
        this.projectRepos = projectRepos;
    }
    @AfterEach
    void tearDown() {
        projectCategoryRepos.deleteAll();
        projectRepos.deleteAll();
        milestoneRepos.deleteAll();
        accountRepos.deleteAll();
    }

    Milestone createTestMilestone(int id) {
        Milestone milestone = new Milestone();
        Project project = createTestProject(id);
        milestone.setTitle("Milestone "+id);
        milestone.setBudget(BigDecimal.valueOf(1000));
        milestone.setDeadline(LocalDateTime.now().plusDays(30));
        milestone.setStatus(Milestone.MilestoneStatus.PENDING);
        milestone.setVisible(true);
        milestone.setProject(project);
        return milestoneService.create(milestone);
    }
    Account createTestAccount(int id) {
        Account account = new Account();
        account.setEmail("MilestoneTest"+id+"@example.com");
        account.setPassword("password");
        account.setVisible(true);
        account.setBalance(BigDecimal.valueOf(0));
        account.setVerified(false);
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
        testCategory.setVisible(true);
        testCategory = projectCategoryRepos.save(testCategory);

        // Then create the project with the saved category
        Project testProject = new Project();
        testProject.setTitle("Test Project");
        testProject.setDescription("Test Description");
        testProject.setCategory(testCategory);
        testProject.setClient(employer);
        testProject.setStatus(Project.ProjectStatus.OPEN);
        testProject.setVisible(true);

        return projectService.create(testProject);
        // Set other necessary fields
    }


    @Test
    @Order(1)
    void createMilestoneSuccessfully() {
        Milestone milestone = createTestMilestone(1);

        assertNotNull(milestone);
        assertEquals("Milestone 1", milestone.getTitle());
    }

    @Test
    @Order(2)
    void createMilestoneWithNullTitle() {
        Milestone milestone = new Milestone();
        milestone.setBudget(BigDecimal.valueOf(1000));
        milestone.setDeadline(LocalDateTime.now().plusDays(30));
        milestone.setStatus(Milestone.MilestoneStatus.PENDING);
        milestone.setVisible(true);

        assertThrows(RuntimeException.class, () -> milestoneService.create(milestone));
    }

    @Test
    @Order(3)
    void findMilestoneByIdSuccessfully() {
        Milestone milestone = createTestMilestone(1);

        Milestone foundMilestone = milestoneService.findById(milestone.getMilestoneId());

        assertNotNull(foundMilestone);
        assertEquals(milestone.getMilestoneId(), foundMilestone.getMilestoneId());
    }

    @Test
    @Order(4)
    void findMilestoneByIdNotFound() {
        assertNull(milestoneService.findById(999L));
    }

    @Test
    @Order(5)
    void updateMilestoneSuccessfully() {
        Milestone milestone = createTestMilestone(1);
        milestone.setTitle("Updated Milestone");

        Milestone updatedMilestone = milestoneService.update(milestone);

        assertNotNull(updatedMilestone);
        assertEquals("Updated Milestone", updatedMilestone.getTitle());
    }

    @Test
    @Order(6)
    void updateMilestoneNotFound() {
        Milestone milestone = new Milestone();
        milestone.setMilestoneId(999L);
        milestone.setTitle("Milestone 1");
        milestone.setBudget(BigDecimal.valueOf(1000));
        milestone.setDeadline(LocalDateTime.now().plusDays(30));
        milestone.setStatus(Milestone.MilestoneStatus.PENDING);
        milestone.setVisible(true);

        assertThrows(RuntimeException.class, () -> milestoneService.update(milestone));
    }

    @Test
    @Order(7)
    void deleteMilestoneByIdSuccessfully() {
        Milestone milestone = createTestMilestone(1);

        milestoneService.deleteById(milestone.getMilestoneId());

        assertFalse(milestoneService.findById(milestone.getMilestoneId()).isVisible());
    }

    @Test
    @Order(8)
    void deleteMilestoneByIdNotFound() {
        assertThrows(RuntimeException.class, () -> milestoneService.deleteById(999L));
    }

    @Test
    @Order(9)
    void getAllMilestonesSuccessfully() {
        Milestone milestone1 = createTestMilestone(1);
        Milestone milestone2 = createTestMilestone(2);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Milestone> milestonesPage = milestoneService.getAll(pageable, null);

        assertTrue(milestonesPage.getTotalElements() >= 2);
    }

    @Test
    @Order(10)
    void getAllMilestonesWithFilter() {
        Milestone milestone1 = createTestMilestone(1);
        Milestone milestone2 = createTestMilestone(2);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Milestone> milestonesPage = milestoneService.getAll(pageable, "title,contains,Milestone");

        assertTrue(milestonesPage.getTotalElements() >= 2);
    }
}