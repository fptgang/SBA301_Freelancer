
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
class ProposalServiceTest {

    @Container
    @ServiceConnection
    static MySQLContainer<?> mysql = new MySQLContainer<>(DockerImageName.parse("mysql:latest"));


    private final AccountService accountService;
    private final AccountRepos accountRepos;
    private final ProjectCategoryRepos projectCategoryRepos;
    private final ProjectService projectService;
    private final ProposalService proposalService;
    private final ProjectRepos projectRepos;
    private final ProposalRepos proposalRepos;

    @Autowired
    public ProposalServiceTest( AccountService accountService, AccountRepos accountRepos, ProjectCategoryRepos projectCategoryRepos, ProjectCategoryRepos projectCategoryRepos1, ProjectService projectService, ProposalService proposalService, ProjectRepos projectRepos, ProposalRepos proposalRepos) {
        this.accountService = accountService;
        this.accountRepos = accountRepos;
        this.projectCategoryRepos = projectCategoryRepos1;
        this.projectService = projectService;
        this.proposalService = proposalService;
        this.projectRepos = projectRepos;
        this.proposalRepos = proposalRepos;
    }
    @AfterEach
    void tearDown() {
        proposalRepos.deleteAll();
        projectRepos.deleteAll();
        accountRepos.deleteAll();
    }
    Account createTestAccount(int id) {
        Account account = new Account();
        account.setEmail("ProposalTest"+id+"@example.com");
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
        Account employer = createTestAccount(id);
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
    Proposal createTestProposal(int id) {
        Project project = createTestProject(id);
        Account freelancer = createTestAccount(id+1);
        Proposal proposal = new Proposal();
        proposal.setProject(project);
        proposal.setFreelancer(freelancer);
        proposal.setStatus(Proposal.ProposalStatus.PENDING);
        proposal.setVisible(true);
        return proposalService.create(proposal);
    }

    @Test
    @Order(1)
    void createProposalSuccessfully() {
        Proposal proposal = createTestProposal(1);

        assertNotNull(proposal);
        assertEquals(Proposal.ProposalStatus.PENDING, proposal.getStatus());
    }

    @Test
    @Order(2)
    void createProposalWithNullProject() {
        Proposal proposal = new Proposal();
        Account freelancer = new Account();
        freelancer.setAccountId(1L);
        proposal.setFreelancer(freelancer);
        proposal.setStatus(Proposal.ProposalStatus.PENDING);
        proposal.setVisible(true);

        assertThrows(RuntimeException.class, () -> proposalService.create(proposal));
    }

    @Test
    @Order(3)
    void findProposalByIdSuccessfully() {
        Proposal proposal = createTestProposal(1);

        Proposal foundProposal = proposalService.findById(proposal.getProposalId());

        assertNotNull(foundProposal);
        assertEquals(proposal.getProposalId(), foundProposal.getProposalId());
    }

    @Test
    @Order(4)
    void findProposalByIdNotFound() {
        assertThrows(RuntimeException.class, () -> proposalService.findById(999L));
    }

    @Test
    @Order(5)
    void updateProposalSuccessfully() {
        Proposal proposal = createTestProposal(1);
        proposal.setStatus(Proposal.ProposalStatus.ACCEPTED);

        Proposal updatedProposal = proposalService.update(proposal);

        assertNotNull(updatedProposal);
        assertEquals(Proposal.ProposalStatus.ACCEPTED, updatedProposal.getStatus());
    }

    @Test
    @Order(6)
    void updateProposalNotFound() {
        Proposal proposal = new Proposal();
        proposal.setProposalId(999L);
        proposal.setStatus(Proposal.ProposalStatus.PENDING);
        proposal.setVisible(true);

        assertThrows(RuntimeException.class, () -> proposalService.update(proposal));
    }

    @Test
    @Order(7)
    void deleteProposalByIdSuccessfully() {
        Proposal proposal = createTestProposal(1);

        proposalService.deleteById(proposal.getProposalId());

        assertFalse(proposalService.findById(proposal.getProposalId()).isVisible());
    }

    @Test
    @Order(8)
    void deleteProposalByIdNotFound() {
        assertThrows(RuntimeException.class, () -> proposalService.deleteById(999L));
    }

    @Test
    @Order(9)
    void getAllProposalsSuccessfully() {
        Proposal proposal1 = createTestProposal(1);
        Proposal proposal2 = createTestProposal(3);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Proposal> proposalsPage = proposalService.getAll(pageable, null);

        assertTrue(proposalsPage.getTotalElements() >= 2);
    }

    @Test
    @Order(10)
    void getAllProposalsWithFilter() {
        Proposal proposal1 = createTestProposal(1);
        Proposal proposal2 = createTestProposal(3);

        Pageable pageable = PageRequest.of(0, 10);
        Page<Proposal> proposalsPage = proposalService.getAll(pageable, "status,contains,PENDING");

        assertTrue(proposalsPage.getTotalElements() >= 2);
    }
}