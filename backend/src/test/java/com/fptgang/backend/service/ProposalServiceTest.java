package com.fptgang.backend.service;

import com.fptgang.backend.model.Proposal;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.repository.ProposalRepos;
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

    @Autowired
    private ProposalService proposalService;
    @Autowired
    private ProposalRepos proposalRepos;

    @AfterEach
    void tearDown() {
        proposalRepos.deleteAll();
    }

    Proposal createTestProposal() {
        Project project = new Project();
        project.setProjectId(1L);
        Account freelancer = new Account();
        freelancer.setAccountId(1L);
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
        Proposal proposal = createTestProposal();

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
        Proposal proposal = createTestProposal();

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
        Proposal proposal = createTestProposal();
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
        Proposal proposal = createTestProposal();

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
        Proposal proposal1 = createTestProposal();
        Proposal proposal2 = createTestProposal();

        Pageable pageable = PageRequest.of(0, 10);
        Page<Proposal> proposalsPage = proposalService.getAll(pageable, "");

        assertTrue(proposalsPage.getTotalElements() >= 2);
    }

    @Test
    @Order(10)
    void getAllProposalsWithFilter() {
        Proposal proposal1 = createTestProposal();
        Proposal proposal2 = createTestProposal();

        Pageable pageable = PageRequest.of(0, 10);
        Page<Proposal> proposalsPage = proposalService.getAll(pageable, "status,contains,PENDING");

        assertTrue(proposalsPage.getTotalElements() >= 2);
    }
}