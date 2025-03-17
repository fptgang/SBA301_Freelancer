package com.fptgang.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fptgang.backend.TestcontainersConfiguration;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.model.*;
import com.fptgang.backend.repository.*;
import com.fptgang.backend.security.WithMockAppUser;
import com.fptgang.backend.service.ContractService;
import com.fptgang.backend.service.ProjectService;
import com.fptgang.backend.service.ProposalService;
import com.fptgang.backend.util.ProjectTimeline;
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
import org.springframework.test.annotation.Rollback;
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
public class ProjectUnpauseIntegrationTest {

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
    private PlatformTransactionManager transactionManager;
    private TransactionTemplate transactionTemplate;

    private static MockedStatic<SecurityUtil> securityUtilMock;

    private ProjectCategory projectCategory;
    private Account clientAccount;
    private Project project;
    private AutoCloseable mockitoAnnotations;

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
        accountRepos.save(
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
    public void setUp() {
        projectRepos.deleteAll();
        transactionTemplate = new TransactionTemplate(transactionManager);
    }

    @Test
    @WithMockAppUser(accountId = 1, username = "escrow@example.com", role = "ROLE_ADMIN")
    public void testClientUnpausePausedProject_Success() throws Exception {
        project = Project.builder()
                .title("Title")
                .description("Description")
                .minBudget(BigDecimal.valueOf(100))
                .maxBudget(BigDecimal.valueOf(500))
                .startDate(LocalDateTime.now().plusDays(7))
                .status(Project.ProjectStatus.PAUSED)
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
                                .build()
                )));
        project = projectRepos.save(project);
        Long milestoneId = project.getMilestones().getFirst().getMilestoneId();

        mockSecurityAsClient();
        String response = mockMvc.perform(
                put("/api/v1/projects/" + project.getProjectId() + "/unpause")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new ProjectTimelineDto()
                                        .newStartDate(OffsetDateTime.now().plusDays(3))
                                        .milestones(List.of(
                                                new ProjectTimelineDtoMilestonesInner()
                                                        .milestoneId(milestoneId)
                                                        .newDeadline(OffsetDateTime.now().plusDays(6))
                                        ))
                        ))
                )
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        var dto = objectMapper.readValue(response, ProjectDto.class);
        assertThat(dto.getStatus()).isEqualTo(ProjectStatusDto.OPEN);
        assertThat(dto.getTerminationReason()).isNull();

        // duplication
        mockMvc.perform(
                put("/api/v1/projects/" + project.getProjectId() + "/unpause")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new ProjectTimelineDto()
                                        .newStartDate(OffsetDateTime.now().plusDays(3))
                                        .milestones(List.of(
                                                new ProjectTimelineDtoMilestonesInner()
                                                        .milestoneId(milestoneId)
                                                        .newDeadline(OffsetDateTime.now().plusDays(6))
                                        ))
                        ))
                )
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockAppUser(accountId = 1, username = "escrow@example.com", role = "ROLE_ADMIN")
    public void testClientUnpausePausedProject_FailDueToInvalidTimeline() throws Exception {
        var milestoneId = transactionTemplate.execute(status -> {
            project = Project.builder()
                    .title("Title")
                    .description("Description")
                    .minBudget(BigDecimal.valueOf(100))
                    .maxBudget(BigDecimal.valueOf(500))
                    .startDate(LocalDateTime.now().plusDays(7))
                    .status(Project.ProjectStatus.PAUSED)
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
                                    .build()
                    )));
            project = projectRepos.save(project);
            return project.getMilestones().getFirst().getMilestoneId();
        });

        mockSecurityAsClient();
        mockMvc.perform(
                put("/api/v1/projects/" + project.getProjectId() + "/unpause")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new ProjectTimelineDto()
                                        .newStartDate(OffsetDateTime.now().plusDays(1))
                                        .milestones(List.of(
                                                new ProjectTimelineDtoMilestonesInner()
                                                        .milestoneId(milestoneId)
                                                        .newDeadline(OffsetDateTime.now().plusDays(3))
                                        ))
                        ))
                )
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockAppUser(accountId = 1, username = "escrow@example.com", role = "ROLE_ADMIN")
    public void testClientUnpauseOpenProject_Fail() throws Exception {
        var milestoneId = transactionTemplate.execute(status -> {
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
                                    .build()
                    )));
            project = projectRepos.save(project);
            return project.getMilestones().getFirst().getMilestoneId();
        });

        mockSecurityAsClient();
        mockMvc.perform(
                    put("/api/v1/projects/" + project.getProjectId() + "/unpause")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                            new ProjectTimelineDto()
                                .newStartDate(OffsetDateTime.now().plusDays(3))
                                .milestones(List.of(
                                    new ProjectTimelineDtoMilestonesInner()
                                        .milestoneId(milestoneId)
                                        .newDeadline(OffsetDateTime.now().plusDays(6))
                                ))
                        ))
                ).andExpect(status().isBadRequest());
    }

}
