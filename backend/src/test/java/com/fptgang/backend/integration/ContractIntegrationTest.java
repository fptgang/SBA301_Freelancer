package com.fptgang.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fptgang.backend.TestcontainersConfiguration;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.model.*;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.ProjectCategoryRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.security.WithMockAppUser;
import com.fptgang.backend.service.ContractService;
import com.fptgang.backend.service.ProposalService;
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
import org.springframework.transaction.annotation.Transactional;

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
public class ContractIntegrationTest {

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
    private ProposalService proposalService;

    @Autowired
    private ContractService contractService;

    private Project project;
    private Account freelancerAccount;
    private Contract contract;
    private Proposal proposal;

    @BeforeAll
    public void setUp() {
        projectRepos.deleteAll();
        accountRepos.deleteAll();
        var clientAccount = accountRepos.save(
                Account.builder() // ID=2
                        .email("client@example.com")
                        .firstName("Client")
                        .role(Role.CLIENT)
                        .balance(BigDecimal.valueOf(5000))
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
                                .title("Milestone 1")
                                .budgetRatio(BigDecimal.valueOf(0.4))
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
                                .budgetRatio(BigDecimal.valueOf(0.6))
                                .deadline(LocalDateTime.now().plusDays(15))
                                .status(Milestone.MilestoneStatus.PENDING)
                                .fundStatus(Milestone.FundStatus.NONE)
                                .build())
        ));
        project = projectRepos.save(project);
    }

    @Test
    @Order(1)
    @WithMockAppUser(accountId = 3, username = "freelancer1@example.com", role = "ROLE_FREELANCER")
    public void testFreelancer1CreateProposal_Success() throws Exception {
        proposal = proposalService.create(Proposal.builder()
                .freelancer(freelancerAccount)
                .project(project)
                .status(Proposal.ProposalStatus.PENDING)
                .budget(BigDecimal.valueOf(100))
                .build());
    }

    @Test
    @Order(2)
    @WithMockAppUser(accountId = 2, username = "client@example.com", role = "ROLE_CLIENT")
    public void testClientAcceptProposal_Success() throws Exception {
        contract = contractService.create(proposal.getProposalId());
    }

    @Test
    @Order(3)
    @WithMockAppUser(accountId = 3, username = "freelancer1@example.com", role = "ROLE_FREELANCER")
    @Transactional
    @Commit
    public void testFreelancer1SignContract_Success() throws Exception {
        String response = mockMvc.perform(put("/api/v1/contracts/" + contract.getContractId() + "/sign")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        var dto = objectMapper.readValue(response, ContractDto.class);
        assertThat(dto.getBudget().compareTo(BigDecimal.valueOf(100))).isZero();
        assertThat(dto.getStatus()).isEqualTo(ContractStatusDto.SIGNED);

        project = projectRepos.findByProjectId(project.getProjectId()).orElseThrow();
        assertThat(project.getActiveMilestone()).isEqualTo(project.getMilestones().getFirst());
        assertThat(project.getActiveMilestone().getStatus()).isEqualTo(Milestone.MilestoneStatus.IN_PROGRESS);
    }

    @Test
    @Order(4)
    @WithMockAppUser(accountId = 3, username = "freelancer1@example.com", role = "ROLE_FREELANCER")
    public void testFreelancer1SignContract_Signed() throws Exception {
        mockMvc.perform(put("/api/v1/contracts/" + contract.getContractId() + "/sign")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }
}
