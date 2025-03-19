package com.fptgang.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fptgang.backend.TestcontainersConfiguration;
import com.fptgang.backend.api.model.ProjectDto;
import com.fptgang.backend.api.model.ProjectStatusDto;
import com.fptgang.backend.api.model.ProjectTimelineDto;
import com.fptgang.backend.api.model.ProjectTimelineDtoMilestonesInner;
import com.fptgang.backend.model.*;
import com.fptgang.backend.repository.*;
import com.fptgang.backend.security.WithMockAppUser;
import com.fptgang.backend.service.ContractService;
import com.fptgang.backend.service.ProjectService;
import com.fptgang.backend.service.ProposalService;
import com.fptgang.backend.util.DateTimeUtil;
import com.fptgang.backend.util.SecurityUtil;
import jakarta.persistence.EntityManager;
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
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

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
public class ProjectDeadlineExtendIntegrationTest {

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
                                .deadline(LocalDateTime.now().plusDays(17))
                                .status(Milestone.MilestoneStatus.PENDING)
                                .fundStatus(Milestone.FundStatus.NONE)
                                .build()
                )));
        project = projectRepos.save(project);
    }

    //@Test
    @WithMockAppUser(accountId = 1, username = "escrow@example.com", role = "ROLE_ADMIN")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void testClientExtendDeadline_Success() throws Exception {
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
            return contractService.signContract(contract.getContractId());
        });

        project = projectRepos.findByProjectId(project.getProjectId()).orElseThrow();

        mockSecurityAsClient();
        var deadline = LocalDateTime.now().plusDays(15);
        var deadline1 = OffsetDateTime.now().plusDays(18);
        var deadline2 = OffsetDateTime.now().plusDays(22);
        var deadline3 = OffsetDateTime.now().plusDays(27);
        String request = objectMapper.writeValueAsString(
                new ProjectTimelineDto()
                        .milestones(List.of(
                                new ProjectTimelineDtoMilestonesInner()
                                        .milestoneId(project.getMilestones().getFirst().getMilestoneId())
                                        .newDeadline(deadline1),
                                new ProjectTimelineDtoMilestonesInner()
                                        .milestoneId(project.getMilestones().get(2).getMilestoneId())
                                        .newDeadline(deadline2),
                                new ProjectTimelineDtoMilestonesInner()
                                        .milestoneId(project.getMilestones().get(3).getMilestoneId())
                                        .newDeadline(deadline3)
                        ))
        );
        try (MockedStatic<LocalDateTime> mockedStatic = Mockito.mockStatic(LocalDateTime.class)) {
            mockedStatic.when(LocalDateTime::now).thenReturn(deadline);

            String response = mockMvc.perform(
                            put("/api/v1/projects/" + project.getProjectId() + "/extend-deadline")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(request)
                    )
                    .andExpect(status().isOk())
                    .andReturn()
                    .getResponse()
                    .getContentAsString();

            var dto = objectMapper.readValue(response, ProjectDto.class);
            assertThat(dto.getStatus()).isEqualTo(ProjectStatusDto.IN_PROGRESS);
        }

    }

    @Test
    @WithMockAppUser(accountId = 1, username = "escrow@example.com", role = "ROLE_ADMIN")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void testClientExtendDeadline_FailDueToDeadlineNotPassed() throws Exception {
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
            return contractService.signContract(contract.getContractId());
        });

        project = projectRepos.findByProjectId(project.getProjectId()).orElseThrow();

        mockSecurityAsClient();

            mockMvc.perform(
                            put("/api/v1/projects/" + project.getProjectId() + "/extend-deadline")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(objectMapper.writeValueAsString(
                                            new ProjectTimelineDto()
                                                    .milestones(List.of(
                                                            new ProjectTimelineDtoMilestonesInner()
                                                                    .milestoneId(project.getMilestones().getFirst().getMilestoneId())
                                                                    .newDeadline(OffsetDateTime.now().plusDays(6)),
                                                            new ProjectTimelineDtoMilestonesInner()
                                                                    .milestoneId(project.getMilestones().get(2).getMilestoneId())
                                                                    .newDeadline(OffsetDateTime.now().plusDays(10)),
                                                            new ProjectTimelineDtoMilestonesInner()
                                                                    .milestoneId(project.getMilestones().get(3).getMilestoneId())
                                                                    .newDeadline(OffsetDateTime.now().plusDays(15))
                                                    ))
                                    ))
                    )
                    .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockAppUser(accountId = 1, username = "escrow@example.com", role = "ROLE_ADMIN")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void testClientExtendDeadline_FailDueToInvalidTimeline() throws Exception {
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
            return contractService.signContract(contract.getContractId());
        });

        project = projectRepos.findByProjectId(project.getProjectId()).orElseThrow();

        mockSecurityAsClient();
        mockMvc.perform(
                        put("/api/v1/projects/" + project.getProjectId() + "/extend-deadline")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(
                                        new ProjectTimelineDto()
                                                .milestones(List.of(
                                                        new ProjectTimelineDtoMilestonesInner()
                                                                .milestoneId(project.getMilestones().getFirst().getMilestoneId())
                                                                .newDeadline(OffsetDateTime.now().plusDays(6))
                                                ))
                                ))
                )
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockAppUser(accountId = 1, username = "escrow@example.com", role = "ROLE_ADMIN")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void testClientExtendDeadline_FailDueToUnsignedContract() throws Exception {
        transactionTemplate.execute(status -> {
            mockSecurityAsFreelancer();
            var proposal = proposalService.create(Proposal.builder()
                    .freelancer(freelancerAccount)
                    .project(project)
                    .status(Proposal.ProposalStatus.PENDING)
                    .budget(BigDecimal.valueOf(100))
                    .build());

            mockSecurityAsClient();
            return contractService.create(proposal.getProposalId());
        });

        project = projectRepos.findByProjectId(project.getProjectId()).orElseThrow();

        mockSecurityAsClient();
        mockMvc.perform(
                        put("/api/v1/projects/" + project.getProjectId() + "/extend-deadline")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(
                                        new ProjectTimelineDto()
                                                .milestones(List.of(
                                                        new ProjectTimelineDtoMilestonesInner()
                                                                .milestoneId(project.getMilestones().getFirst().getMilestoneId())
                                                                .newDeadline(OffsetDateTime.now().plusDays(6))
                                                ))
                                ))
                )
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockAppUser(accountId = 1, username = "escrow@example.com", role = "ROLE_ADMIN")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void testClientExtendDeadline_FailDueToNoContract() throws Exception {
        transactionTemplate.execute(status -> {
            mockSecurityAsFreelancer();
            return proposalService.create(Proposal.builder()
                    .freelancer(freelancerAccount)
                    .project(project)
                    .status(Proposal.ProposalStatus.PENDING)
                    .budget(BigDecimal.valueOf(100))
                    .build());
        });

        project = projectRepos.findByProjectId(project.getProjectId()).orElseThrow();

        mockSecurityAsClient();
        mockMvc.perform(
                        put("/api/v1/projects/" + project.getProjectId() + "/extend-deadline")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(
                                        new ProjectTimelineDto()
                                                .milestones(List.of(
                                                        new ProjectTimelineDtoMilestonesInner()
                                                                .milestoneId(project.getMilestones().getFirst().getMilestoneId())
                                                                .newDeadline(OffsetDateTime.now().plusDays(6))
                                                ))
                                ))
                )
                .andExpect(status().isBadRequest());
    }

}
