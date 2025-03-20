package com.fptgang.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fptgang.backend.TestcontainersConfiguration;
import com.fptgang.backend.api.model.ContractStatusDto;
import com.fptgang.backend.api.model.ProjectDto;
import com.fptgang.backend.api.model.ProjectStatusDto;
import com.fptgang.backend.api.model.ProjectTerminationReasonDto;
import com.fptgang.backend.model.*;
import com.fptgang.backend.repository.*;
import com.fptgang.backend.security.WithMockAppUser;
import com.fptgang.backend.service.ContractService;
import com.fptgang.backend.service.ProjectService;
import com.fptgang.backend.service.ProposalService;
import com.fptgang.backend.util.SecurityUtil;
import jakarta.persistence.EntityManager;
import org.hibernate.Hibernate;
import org.junit.jupiter.api.*;
import org.junit.runner.RunWith;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.Commit;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mockStatic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@RunWith(SpringRunner.class)
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("dev")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
public class ProjectTerminateIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AccountRepos accountRepos;
    @Autowired
    private ProjectCategoryRepos projectCategoryRepos;
    @Autowired
    private ProjectRepos projectRepos;
    @Autowired
    private ContractRepos contractRepos;
    @Autowired
    private ProposalRepos proposalRepos;

    @Autowired
    private ProposalService proposalService;
    @Autowired
    private ContractService contractService;
    @Autowired
    private PlatformTransactionManager transactionManager;
    private TransactionTemplate transactionTemplate;

    private static MockedStatic<SecurityUtil> securityUtilMock;

    private ProjectCategory projectCategory;
    private Account clientAccount;
    private Account freelancerAccount;
    private Project project;
    private AutoCloseable mockitoAnnotations;
    @Autowired
    private EntityManager entityManager;
    @Autowired
    private ProjectService projectService;

    @BeforeAll
    @Transactional
    public void init() {
        projectRepos.deleteAll();

        projectCategoryRepos.deleteAll();
        projectCategory = projectCategoryRepos.save(ProjectCategory.builder().name("Test").isVisible(true).build());

        accountRepos.deleteAll();
        clientAccount = accountRepos.save(
                Account.builder() // ID=2
                        .email("client@example.com")
                        .firstName("Client")
                        .role(Role.CLIENT)
                        .balance(BigDecimal.valueOf(50000))
                        .isVerified(true)
                        .isVisible(true)
                        .build()
        );
        freelancerAccount = accountRepos.save(
                Account.builder() // ID=3
                        .email("freelancer1@example.com")
                        .firstName("Freelancer 1")
                        .role(Role.FREELANCER)
                        .isVerified(true)
                        .isVisible(true)
                        .build()
        );
        accountRepos.save(
                Account.builder() // ID=4
                        .email("staff@example.com")
                        .firstName("Staff")
                        .role(Role.STAFF)
                        .isVerified(true)
                        .isVisible(true)
                        .build()
        );
        securityUtilMock = mockStatic(SecurityUtil.class);
        mockitoAnnotations = MockitoAnnotations.openMocks(this);
    }

    @AfterAll
    void tearDown() throws Exception {
        securityUtilMock.close();
        mockitoAnnotations.close();
    }

    private void mockSecurityAsClient() {
        securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(2L);
        securityUtilMock.when(SecurityUtil::getCurrentUserEmail).thenReturn("client@example.com");
        securityUtilMock.when(SecurityUtil::getCurrentUserRole).thenReturn(Role.CLIENT);
        securityUtilMock.when(SecurityUtil::isAuthenticated).thenReturn(true);
    }

    private void mockSecurityAsFreelancer() {
        securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(3L);
        securityUtilMock.when(SecurityUtil::getCurrentUserEmail).thenReturn("freelancer1@example.com");
        securityUtilMock.when(SecurityUtil::getCurrentUserRole).thenReturn(Role.FREELANCER);
        securityUtilMock.when(SecurityUtil::isAuthenticated).thenReturn(true);
    }

    private void mockSecurityAsStaff() {
        securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(4L);
        securityUtilMock.when(SecurityUtil::getCurrentUserEmail).thenReturn("staff@example.com");
        securityUtilMock.when(SecurityUtil::getCurrentUserRole).thenReturn(Role.STAFF);
        securityUtilMock.when(SecurityUtil::isAuthenticated).thenReturn(true);
    }

    @BeforeEach
    @Transactional
    @Commit
    public void setUp() {
        transactionTemplate = new TransactionTemplate(transactionManager);
        contractRepos.deleteAll();
        proposalRepos.deleteAll();
        projectRepos.deleteAll();

        project = Project.builder()
                .title("Title")
                .description("Description")
                .minBudget(BigDecimal.valueOf(100))
                .maxBudget(BigDecimal.valueOf(500))
                .startDate(LocalDateTime.now().plusDays(7))
                .status(Project.ProjectStatus.OPEN)
                .client(clientAccount)
                .category(projectCategory)
                .isVisible(true)
                .build();
        project.setMilestones(new ArrayList<>(
                List.of(
                        Milestone.builder()
                                .project(project)
                                .title("Milestone 1")
                                .budgetRatio(BigDecimal.valueOf(0.6))
                                .deadline(LocalDateTime.now().plusDays(12))
                                .status(Milestone.MilestoneStatus.PENDING)
                                .fundStatus(Milestone.FundStatus.NONE)
                                .build(),
                        Milestone.builder()
                                .project(project)
                                .title("Milestone Deleted")
                                .budgetRatio(BigDecimal.valueOf(0.4))
                                .deadline(LocalDateTime.now().plusDays(12))
                                .status(Milestone.MilestoneStatus.PENDING)
                                .fundStatus(Milestone.FundStatus.NONE)
                                .isVisible(false)
                                .build(),
                        Milestone.builder()
                                .project(project)
                                .title("Milestone 2")
                                .budgetRatio(BigDecimal.valueOf(0.2))
                                .deadline(LocalDateTime.now().plusDays(15))
                                .status(Milestone.MilestoneStatus.PENDING)
                                .fundStatus(Milestone.FundStatus.NONE)
                                .build(),
                        Milestone.builder()
                                .project(project)
                                .title("Milestone 3")
                                .budgetRatio(BigDecimal.valueOf(0.2))
                                .deadline(LocalDateTime.now().plusDays(15))
                                .status(Milestone.MilestoneStatus.PENDING)
                                .fundStatus(Milestone.FundStatus.NONE)
                                .build()
                )));
        project = projectRepos.save(project);
    }

    @Test
    @WithMockAppUser(accountId = 1, username = "escrow@example.com", role = "ROLE_ADMIN")
    public void testClientTerminateOpenProject_Success() throws Exception {
        mockSecurityAsClient();
        String response = mockMvc.perform(put("/api/v1/projects/" + project.getProjectId() + "/terminate")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        var dto = objectMapper.readValue(response, ProjectDto.class);
        assertThat(dto.getStatus()).isEqualTo(ProjectStatusDto.TERMINATED);
        assertThat(dto.getTerminationReason()).isEqualTo(ProjectTerminationReasonDto.OTHER);

        // duplication
        mockMvc.perform(
                        put("/api/v1/projects/" + project.getProjectId() + "/terminate")
                                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockAppUser(accountId = 1, username = "escrow@example.com", role = "ROLE_ADMIN")
    public void testClientTerminateInProgressProject_FailedDueToUnsignedContract() throws Exception {

        transactionTemplate.execute(status -> {
            mockSecurityAsFreelancer();
            var proposal = proposalService.create(Proposal.builder()
                    .freelancer(freelancerAccount)
                    .project(project)
                    .status(Proposal.ProposalStatus.PENDING)
                    .budget(BigDecimal.valueOf(100))
                    .build());

            mockSecurityAsClient();
            contractService.create(proposal.getProposalId());
            return null;
        });

        mockSecurityAsClient();
        mockMvc.perform(put("/api/v1/projects/" + project.getProjectId() + "/terminate")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockAppUser(accountId = 1, username = "escrow@example.com", role = "ROLE_ADMIN")
    @Transactional
    public void testClientTerminateInProgressProject_FailedDueToPastNoticePeriod() throws Exception {
        // Setup data
        mockSecurityAsFreelancer();
        var proposal = proposalService.create(Proposal.builder()
                .freelancer(freelancerAccount)
                .project(project)
                .status(Proposal.ProposalStatus.PENDING)
                .budget(BigDecimal.valueOf(100))
                .build());

        mockSecurityAsClient();
        var contract = contractService.create(proposal.getProposalId());

        mockSecurityAsFreelancer();
        contractService.signContract(contract.getContractId());

        Project freshProject = projectRepos.findById(project.getProjectId()).orElseThrow();
        LocalDateTime deadline = freshProject.getActiveMilestone().getDeadline();

        mockSecurityAsClient();
        try (MockedStatic<LocalDateTime> mockedStatic = Mockito.mockStatic(LocalDateTime.class)) {
            mockedStatic.when(LocalDateTime::now).thenReturn(deadline);

            mockMvc.perform(put("/api/v1/projects/" + project.getProjectId() + "/terminate")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isBadRequest());
        }
    }

    @Test
    @WithMockAppUser(accountId = 1, username = "escrow@example.com", role = "ROLE_ADMIN")
    public void testClientToTerminateInProgressProject_Success() throws Exception {
        transactionTemplate.execute(status -> {
            mockSecurityAsFreelancer();
            var proposal = proposalService.create(Proposal.builder()
                    .freelancer(freelancerAccount)
                    .project(project)
                    .status(Proposal.ProposalStatus.PENDING)
                    .budget(BigDecimal.valueOf(100))
                    .build());

            mockSecurityAsClient();
            var contract = contractService.create(proposal.getProposalId());

            mockSecurityAsFreelancer();
            contractService.signContract(contract.getContractId());
            return null;
        });

        mockSecurityAsClient();
        var response = mockMvc.perform(put("/api/v1/projects/" + project.getProjectId() + "/terminate")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        var dto = objectMapper.readValue(response, ProjectDto.class);
        assertThat(dto.getStatus()).isEqualTo(ProjectStatusDto.IN_PROGRESS);
        assertThat(dto.getToTerminate()).isTrue();
    }

    @Test
    @WithMockAppUser(accountId = 1, username = "escrow@example.com", role = "ROLE_ADMIN")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void testStaffTerminateOpenProject_Success() throws Exception {
        var pj = transactionTemplate.execute(status -> {
            mockSecurityAsStaff();
            return projectService.terminateByStaff(project.getProjectId(), Role.CLIENT);
        });
        assertThat(pj).isNotNull();
        pj = projectRepos.findById(pj.getProjectId()).orElseThrow();
        assertThat(pj.getStatus()).isEqualTo(Project.ProjectStatus.TERMINATED);
        assertThat(pj.getTerminationReason()).isEqualTo(Project.TerminationReason.STAFF_DECISION);

        for (Milestone milestone : pj.getMilestones()) {
            if (!milestone.getIsVisible()) continue;
            assertThat(milestone.getFundStatus()).isEqualTo(Milestone.FundStatus.NONE);
            assertThat(milestone.getStatus()).isEqualTo(Milestone.MilestoneStatus.TERMINATED);
            assertThat(milestone.getTransactions()).isEmpty();
        }
    }

    @Test
    @WithMockAppUser(accountId = 1, username = "escrow@example.com", role = "ROLE_ADMIN")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void testStaffTerminateUnsignedContractInProgressProject_Success() throws Exception {
        var pj = transactionTemplate.execute(status -> {
            mockSecurityAsFreelancer();
            var proposal = proposalService.create(Proposal.builder()
                    .freelancer(freelancerAccount)
                    .project(project)
                    .status(Proposal.ProposalStatus.PENDING)
                    .budget(BigDecimal.valueOf(100))
                    .build());

            mockSecurityAsClient();
            contractService.create(proposal.getProposalId());

            mockSecurityAsStaff();
            return projectService.terminateByStaff(project.getProjectId(), Role.CLIENT);
        });

        assertThat(pj).isNotNull();
        pj = projectRepos.findById(pj.getProjectId()).orElseThrow();
        assertThat(pj.getStatus()).isEqualTo(Project.ProjectStatus.TERMINATED);
        assertThat(pj.getTerminationReason()).isEqualTo(Project.TerminationReason.STAFF_DECISION);
        assertThat(pj.getContract()).isNotNull();
        assertThat(pj.getContract().getStatus()).isEqualTo(Contract.ContractStatus.TERMINATED);

        var milestones = pj.getMilestones().stream().filter(Milestone::getIsVisible).toArray(Milestone[]::new);
        assertThat(milestones[0].getFundStatus()).isEqualTo(Milestone.FundStatus.REFUNDED);
        assertThat(milestones[0].getStatus()).isEqualTo(Milestone.MilestoneStatus.TERMINATED);
        assertThat(milestones[0].getTransactions().size()).isEqualTo(2);

        for (int i = 1; i < milestones.length; i++) {
            assertThat(milestones[i].getFundStatus()).isEqualTo(Milestone.FundStatus.NONE);
            assertThat(milestones[i].getStatus()).isEqualTo(Milestone.MilestoneStatus.TERMINATED);
            assertThat(milestones[i].getTransactions()).isEmpty();
        }
    }

    @Test
    @WithMockAppUser(accountId = 1, username = "escrow@example.com", role = "ROLE_ADMIN")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void testStaffTerminateSignedContractInProgressProject_SuccessReturnClient() throws Exception {
        var pj = transactionTemplate.execute(status -> {
            mockSecurityAsFreelancer();
            var proposal = proposalService.create(Proposal.builder()
                    .freelancer(freelancerAccount)
                    .project(project)
                    .status(Proposal.ProposalStatus.PENDING)
                    .budget(BigDecimal.valueOf(100))
                    .build());

            mockSecurityAsClient();
            var contract = contractService.create(proposal.getProposalId());

            mockSecurityAsFreelancer();
            contractService.signContract(contract.getContractId());

            mockSecurityAsStaff();
            return projectService.terminateByStaff(project.getProjectId(), Role.CLIENT);
        });

        assertThat(pj).isNotNull();
        pj = projectRepos.findById(pj.getProjectId()).orElseThrow();
        assertThat(pj.getStatus()).isEqualTo(Project.ProjectStatus.TERMINATED);
        assertThat(pj.getTerminationReason()).isEqualTo(Project.TerminationReason.STAFF_DECISION);
        assertThat(pj.getContract()).isNotNull();
        assertThat(pj.getContract().getStatus()).isEqualTo(Contract.ContractStatus.TERMINATED);

        var milestones = pj.getMilestones().stream().filter(Milestone::getIsVisible).toArray(Milestone[]::new);
        assertThat(milestones[0].getFundStatus()).isEqualTo(Milestone.FundStatus.REFUNDED);
        assertThat(milestones[0].getStatus()).isEqualTo(Milestone.MilestoneStatus.TERMINATED);
        assertThat(milestones[0].getTransactions().size()).isEqualTo(2);

        for (int i = 1; i < milestones.length; i++) {
            assertThat(milestones[i].getFundStatus()).isEqualTo(Milestone.FundStatus.NONE);
            assertThat(milestones[i].getStatus()).isEqualTo(Milestone.MilestoneStatus.TERMINATED);
            assertThat(milestones[i].getTransactions()).isEmpty();
        }

    }

    @Test
    @WithMockAppUser(accountId = 1, username = "escrow@example.com", role = "ROLE_ADMIN")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void testStaffTerminateSignedContractInProgressProject_SuccessReleaseFreelancer() throws Exception {
        var pj = transactionTemplate.execute(status -> {
            mockSecurityAsFreelancer();
            var proposal = proposalService.create(Proposal.builder()
                    .freelancer(freelancerAccount)
                    .project(project)
                    .status(Proposal.ProposalStatus.PENDING)
                    .budget(BigDecimal.valueOf(100))
                    .build());

            mockSecurityAsClient();
            var contract = contractService.create(proposal.getProposalId());

            mockSecurityAsFreelancer();
            contractService.signContract(contract.getContractId());

            mockSecurityAsStaff();
            return projectService.terminateByStaff(project.getProjectId(), Role.FREELANCER);
        });

        assertThat(pj).isNotNull();
        pj = projectRepos.findById(pj.getProjectId()).orElseThrow();
        assertThat(pj.getStatus()).isEqualTo(Project.ProjectStatus.TERMINATED);
        assertThat(pj.getTerminationReason()).isEqualTo(Project.TerminationReason.STAFF_DECISION);
        assertThat(pj.getContract()).isNotNull();
        assertThat(pj.getContract().getStatus()).isEqualTo(Contract.ContractStatus.TERMINATED);

        var milestones = pj.getMilestones().stream().filter(Milestone::getIsVisible).toArray(Milestone[]::new);
        assertThat(milestones[0].getFundStatus()).isEqualTo(Milestone.FundStatus.RELEASED);
        assertThat(milestones[0].getStatus()).isEqualTo(Milestone.MilestoneStatus.TERMINATED);
        assertThat(milestones[0].getTransactions().size()).isEqualTo(2);

        for (int i = 1; i < milestones.length; i++) {
            assertThat(milestones[i].getFundStatus()).isEqualTo(Milestone.FundStatus.NONE);
            assertThat(milestones[i].getStatus()).isEqualTo(Milestone.MilestoneStatus.TERMINATED);
            assertThat(milestones[i].getTransactions()).isEmpty();
        }

    }

}
