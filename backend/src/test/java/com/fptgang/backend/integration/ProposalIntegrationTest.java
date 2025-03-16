package com.fptgang.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fptgang.backend.TestcontainersConfiguration;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.model.*;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.ProjectCategoryRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.security.WithMockAppUser;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.*;
import org.junit.runner.RunWith;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
public class ProposalIntegrationTest {

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

    private Project project;
    private Account clientAccount;
    private Long proposalOfFreelancer1;
    private Long proposalOfFreelancer2;
    private Long proposalOfFreelancer3;

    @BeforeAll
    public void setUp() {
        projectRepos.deleteAll();
        accountRepos.deleteAll();
        clientAccount = accountRepos.save(
                Account.builder() // ID=2
                        .email("client@example.com")
                        .firstName("Client")
                        .role(Role.CLIENT)
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
                        .email("freelancer2@example.com")
                        .firstName("Freelancer 2")
                        .role(Role.FREELANCER)
                        .isVerified(true)
                        .isVisible(true)
                        .build()
        );
        accountRepos.save(
                Account.builder() // ID=5
                        .email("freelancer3@example.com")
                        .firstName("Freelancer 3")
                        .role(Role.FREELANCER)
                        .isVerified(true)
                        .isVisible(true)
                        .build()
        );

        projectCategoryRepos.deleteAll();
        ProjectCategory projectCategory = projectCategoryRepos.save(ProjectCategory.builder().name("Test").isVisible(true).build());

        project = Project.builder()
                .title("Original Title")
                .description("Original Description")
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
                                        .title("Milestone DEAD")
                                        .budgetRatio(BigDecimal.valueOf(1))
                                        .deadline(LocalDateTime.now().plusDays(0))
                                        .status(Milestone.MilestoneStatus.PENDING)
                                        .fundStatus(Milestone.FundStatus.NONE)
                                        .build(),
                                Milestone.builder()
                                        .project(project)
                                        .title("Milestone 1")
                                        .budgetRatio(BigDecimal.valueOf(0.4))
                                        .deadline(LocalDateTime.now().plusDays(12))
                                        .status(Milestone.MilestoneStatus.PENDING)
                                        .fundStatus(Milestone.FundStatus.NONE)
                                        .build(),
                                Milestone.builder()
                                        .project(project)
                                        .title("Milestone DEAD")
                                        .budgetRatio(BigDecimal.valueOf(1))
                                        .deadline(LocalDateTime.now().plusDays(0))
                                        .status(Milestone.MilestoneStatus.PENDING)
                                        .fundStatus(Milestone.FundStatus.NONE)
                                        .build(),
                                Milestone.builder()
                                        .project(project)
                                        .title("Milestone 1")
                                        .budgetRatio(BigDecimal.valueOf(0.4))
                                        .deadline(LocalDateTime.now().plusDays(12))
                                        .status(Milestone.MilestoneStatus.PENDING)
                                        .fundStatus(Milestone.FundStatus.NONE)
                                        .build(),
                                Milestone.builder()
                                        .project(project)
                                        .title("Milestone DEAD")
                                        .budgetRatio(BigDecimal.valueOf(1))
                                        .deadline(LocalDateTime.now().plusDays(0))
                                        .status(Milestone.MilestoneStatus.PENDING)
                                        .fundStatus(Milestone.FundStatus.NONE)
                                        .build(),
                                Milestone.builder()
                                        .project(project)
                                        .title("Milestone DEAD")
                                        .budgetRatio(BigDecimal.valueOf(1))
                                        .deadline(LocalDateTime.now().plusDays(0))
                                        .status(Milestone.MilestoneStatus.PENDING)
                                        .fundStatus(Milestone.FundStatus.NONE)
                                        .build(),
                                Milestone.builder()
                                        .project(project)
                                        .title("Milestone DEAD")
                                        .budgetRatio(BigDecimal.valueOf(1))
                                        .deadline(LocalDateTime.now().plusDays(0))
                                        .status(Milestone.MilestoneStatus.PENDING)
                                        .fundStatus(Milestone.FundStatus.NONE)
                                        .build(),
                                Milestone.builder()
                                        .project(project)
                                        .title("Milestone 2")
                                        .budgetRatio(BigDecimal.valueOf(0.6))
                                        .deadline(LocalDateTime.now().plusDays(15))
                                        .status(Milestone.MilestoneStatus.PENDING)
                                        .fundStatus(Milestone.FundStatus.NONE)
                                        .build())
                ));
        project = projectRepos.save(project);
    }

    @Test
    @Order(0)
    public void testClientAccountId() {
        assertThat(clientAccount.getAccountId()).isEqualTo(2L);
    }

    @Test
    @Order(1)
    @WithMockAppUser(accountId = 3, username = "freelancer1@example.com", role = "ROLE_FREELANCER")
    public void testFreelancer1SendProposal_Success() throws Exception {
        ProposalCreateDto updateDto = new ProposalCreateDto()
                .projectId(project.getProjectId())
                .notes("Hello World")
                .budget(BigDecimal.valueOf(200));

        String response = mockMvc.perform(post("/api/v1/proposals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        var dto = objectMapper.readValue(response, ProposalDto.class);
        proposalOfFreelancer1 = dto.getProposalId();
        assertThat(dto.getBudget().compareTo(BigDecimal.valueOf(200))).isZero();
        assertThat(dto.getNotes()).isEqualTo("Hello World");
        assertThat(dto.getStatus()).isEqualTo(ProposalStatusDto.PENDING);
    }

    @Test
    @Order(2)
    @WithMockAppUser(accountId = 3, username = "freelancer1@example.com", role = "ROLE_FREELANCER")
    public void testFreelancer1SendProposal_Duplicated() throws Exception {
        ProposalCreateDto updateDto = new ProposalCreateDto()
                .projectId(project.getProjectId())
                .notes("Hello World")
                .budget(BigDecimal.valueOf(200));

        mockMvc.perform(post("/api/v1/proposals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(3)
    @WithMockAppUser(accountId = 4, username = "freelancer2@example.com", role = "ROLE_FREELANCER")
    public void testFreelancer2SendProposal_InvalidBudget() throws Exception {
        ProposalCreateDto updateDto = new ProposalCreateDto()
                .projectId(project.getProjectId())
                .notes("Hello World")
                .budget(BigDecimal.valueOf(1000));

        mockMvc.perform(post("/api/v1/proposals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(4)
    @WithMockAppUser(accountId = 4, username = "freelancer2@example.com", role = "ROLE_FREELANCER")
    public void testFreelancer2SendProposal_Success() throws Exception {
        ProposalCreateDto updateDto = new ProposalCreateDto()
                .projectId(project.getProjectId())
                .notes("Hello world")
                .budget(BigDecimal.valueOf(300));

        String response = mockMvc.perform(post("/api/v1/proposals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        var dto = objectMapper.readValue(response, ProposalDto.class);
        proposalOfFreelancer2 = dto.getProposalId();
        assertThat(dto.getBudget().compareTo(BigDecimal.valueOf(300))).isZero();
        assertThat(dto.getNotes()).isEqualTo("Hello world");
        assertThat(dto.getStatus()).isEqualTo(ProposalStatusDto.PENDING);
    }

    @Test
    @Order(5)
    @WithMockAppUser(accountId = 5, username = "freelancer3@example.com", role = "ROLE_FREELANCER")
    public void testFreelancer3SendProposal_Success() throws Exception {
        ProposalCreateDto updateDto = new ProposalCreateDto()
                .projectId(project.getProjectId())
                .notes("Hello-world")
                .budget(BigDecimal.valueOf(500));

        String response = mockMvc.perform(post("/api/v1/proposals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        var dto = objectMapper.readValue(response, ProposalDto.class);
        proposalOfFreelancer3 = dto.getProposalId();
        assertThat(dto.getBudget().compareTo(BigDecimal.valueOf(500))).isZero();
        assertThat(dto.getNotes()).isEqualTo("Hello-world");
        assertThat(dto.getStatus()).isEqualTo(ProposalStatusDto.PENDING);
    }

    @Test
    @Order(6)
    @WithMockAppUser(accountId = 4, username = "freelancer2@example.com", role = "ROLE_FREELANCER")
    public void testFreelancer2WithdrawProposal_Success() throws Exception {
        String response = mockMvc.perform(put("/api/v1/proposals/" + proposalOfFreelancer2 + "/withdraw")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        var dto = objectMapper.readValue(response, ProposalDto.class);
        assertThat(dto.getBudget().compareTo(BigDecimal.valueOf(300))).isZero();
        assertThat(dto.getNotes()).isEqualTo("Hello world");
        assertThat(dto.getStatus()).isEqualTo(ProposalStatusDto.WITHDRAWN);
    }

    @Test
    @Order(7)
    @WithMockAppUser(accountId = 4, username = "freelancer2@example.com", role = "ROLE_FREELANCER")
    public void testFreelancer2WithdrawProposal_Failed() throws Exception {
        mockMvc.perform(put("/api/v1/proposals/" + proposalOfFreelancer2 + "/withdraw")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(8)
    @WithMockAppUser(accountId = 2, username = "client@example.com", role = "ROLE_CLIENT")
    public void testClientRejectProposal1_Success() throws Exception {
        String response = mockMvc.perform(put("/api/v1/proposals/" + proposalOfFreelancer1 + "/reject")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        var dto = objectMapper.readValue(response, ProposalDto.class);
        assertThat(dto.getBudget().compareTo(BigDecimal.valueOf(200))).isZero();
        assertThat(dto.getNotes()).isEqualTo("Hello World");
        assertThat(dto.getStatus()).isEqualTo(ProposalStatusDto.REJECTED);
    }

    @Test
    @Order(9)
    @WithMockAppUser(accountId = 2, username = "client@example.com", role = "ROLE_CLIENT")
    public void testClientRejectProposal1_Failed() throws Exception {
        mockMvc.perform(put("/api/v1/proposals/" + proposalOfFreelancer1 + "/reject")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(10)
    @WithMockAppUser(accountId = 2, username = "client@example.com", role = "ROLE_CLIENT")
    public void testClientRejectProposal2_Failed() throws Exception {
        mockMvc.perform(put("/api/v1/proposals/" + proposalOfFreelancer2 + "/reject")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(11)
    @WithMockAppUser(accountId = 2, username = "client@example.com", role = "ROLE_CLIENT")
    public void testClientAcceptProposal2_Failed() throws Exception {
        mockMvc.perform(post("/api/v1/contracts?proposalId=" + proposalOfFreelancer2)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(12)
    @WithMockAppUser(accountId = 2, username = "client@example.com", role = "ROLE_CLIENT")
    public void testClientAcceptProposal3_NotEnoughBudget() throws Exception {
        mockMvc.perform(post("/api/v1/contracts?proposalId=" + proposalOfFreelancer3)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(13)
    @WithMockAppUser(accountId = 2, username = "client@example.com", role = "ROLE_CLIENT")
    @Transactional
    @Commit
    public void testClientAcceptProposal3_Success() throws Exception {
        clientAccount.setBalance(BigDecimal.valueOf(10000));
        clientAccount = accountRepos.save(clientAccount);
        var response = mockMvc.perform(post("/api/v1/contracts?proposalId=" + proposalOfFreelancer3)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        var dto = objectMapper.readValue(response, ContractDto.class);
        assertThat(dto.getStatus()).isEqualTo(ContractStatusDto.UNSIGNED);
        assertThat(dto.getBudget().compareTo(BigDecimal.valueOf(500))).isZero();
        assertThat(dto.getFreelancer().getAccountId()).isEqualTo(5);

        project = projectRepos.findByProjectId(project.getProjectId()).orElseThrow();
        assertThat(project.getStatus()).isEqualTo(Project.ProjectStatus.IN_PROGRESS);
        assertThat(project.getContract()).isNotNull();
        assertThat(project.getActiveMilestone()).isNull();
        assertThat(project.getContract().getStatus()).isEqualTo(Contract.ContractStatus.UNSIGNED);
        assertThat(project.getContract().getBudget().compareTo(BigDecimal.valueOf(500))).isZero();
        assertThat(project.getContract().getFreelancer().getAccountId()).isEqualTo(5);

        var firstVisible = project.getMilestones().stream()
                .filter(Milestone::getIsVisible)
                .findFirst().orElseThrow();

        for (Milestone milestone : project.getMilestones()) {
            assertThat(milestone.getStatus()).isEqualTo(Milestone.MilestoneStatus.PENDING);

            if (milestone != firstVisible)
                assertThat(milestone.getFundStatus()).isEqualTo(Milestone.FundStatus.NONE);
        }

        assertThat(firstVisible.getFundStatus()).isEqualTo(Milestone.FundStatus.DEPOSITED);
    }
}
