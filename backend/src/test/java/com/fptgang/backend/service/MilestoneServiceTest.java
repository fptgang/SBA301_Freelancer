package com.fptgang.backend.service;

import com.fptgang.backend.model.Milestone;
import com.fptgang.backend.model.Proposal;
import com.fptgang.backend.repository.MilestoneRepos;
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

    @Autowired
    private MilestoneService milestoneService;
    @Autowired
    private MilestoneRepos milestoneRepos;

    @BeforeEach
    void setUp() {
        milestoneRepos.deleteAll();
    }

    Milestone createTestMilestone(Integer milestoneId) {
        Proposal proposal = new Proposal();
        proposal.setProposalId(1L); // Assuming a proposal with ID 1 exists
        Milestone milestone = new Milestone();
        milestone.setProposal(proposal);
        milestone.setTitle("Milestone " + milestoneId);
        milestone.setBudget(BigDecimal.valueOf(1000));
        milestone.setDeadline(LocalDateTime.now().plusDays(30));
        milestone.setStatus(Milestone.MilestoneStatus.PENDING);
        milestone.setVisible(true);
        return milestoneService.create(milestone);
    }

    @Test
    @Order(1)
    void createMilestoneSuccessfully() {
        Milestone milestone = createTestMilestone(0);

        assertNotNull(milestone);
        assertEquals("Milestone", milestone.getTitle());
    }

    @Test
    @Order(2)
    void findMilestoneByIdSuccessfully() {
        Milestone milestone = createTestMilestone(0);

        Milestone foundMilestone = milestoneService.findById(milestone.getMilestoneId());

        assertNotNull(foundMilestone);
        assertEquals(milestone.getMilestoneId(), foundMilestone.getMilestoneId());
    }

    @Test
    @Order(3)
    void findMilestoneByIdNotFound() {
        assertThrows(RuntimeException.class, () -> milestoneService.findById(999L));
    }

    @Test
    @Order(4)
    void updateMilestoneSuccessfully() {
        Milestone milestone = createTestMilestone(0);
        milestone.setTitle("Updated Milestone");

        Milestone updatedMilestone = milestoneService.update(milestone);

        assertNotNull(updatedMilestone);
        assertEquals("Updated Milestone", updatedMilestone.getTitle());
    }

    @Test
    @Order(5)
    void updateMilestoneNotFound() {
        Milestone milestone = new Milestone();
        milestone.setMilestoneId(999L);
        milestone.setTitle("Nonexistent Milestone");
        milestone.setBudget(BigDecimal.valueOf(1000));
        milestone.setDeadline(LocalDateTime.now().plusDays(30));
        milestone.setStatus(Milestone.MilestoneStatus.PENDING);
        milestone.setVisible(true);

        assertThrows(RuntimeException.class, () -> milestoneService.update(milestone));
    }

    @Test
    @Order(6)
    void deleteMilestoneByIdSuccessfully() {
        Milestone milestone = createTestMilestone();

        milestoneService.deleteById(milestone.getMilestoneId());

        assertFalse(milestoneService.findById(milestone.getMilestoneId()).isVisible());
    }

    @Test
    @Order(7)
    void deleteMilestoneByIdNotFound() {
        assertThrows(RuntimeException.class, () -> milestoneService.deleteById(999L));
    }

    @Test
    @Order(8)
    void getAllMilestonesSuccessfully() {
        Milestone milestone1 = createTestMilestone(1);
        Milestone milestone2 = createTestMilestone(2);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Milestone> milestonesPage = milestoneService.getAll(pageable, null);

        assertTrue(milestonesPage.getTotalElements() >= 2);
    }

    @Test
    @Order(9)
    void getAllMilestonesWithFilter() {
        Milestone milestone1 = createTestMilestone(1);
        Milestone milestone2 = createTestMilestone(2);
        Milestone milestone3 = createTestMilestone(3);

        Milestone milestone4 = new Milestone();
        milestone4.setTitle("Unfiltered Milestone");
        milestone4.setBudget(BigDecimal.valueOf(1000));
        milestone4.setDeadline(LocalDateTime.now().plusDays(30));
        milestone4.setStatus(Milestone.MilestoneStatus.PENDING);
        milestone4.setVisible(true);
        milestoneService.create(milestone4);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Milestone> milestonesPage = milestoneService.getAll(pageable, "title,contains,Milestone");

        assertTrue(milestonesPage.getTotalElements() <= 3);
    }
}