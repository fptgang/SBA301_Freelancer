package com.fptgang.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fptgang.backend.TestcontainersConfiguration;
import com.fptgang.backend.api.model.MilestoneCreateDto;
import com.fptgang.backend.api.model.ProjectCreateDto;
import com.fptgang.backend.api.model.ProjectDto;
import com.fptgang.backend.api.model.ProjectStatusDto;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.ProjectCategory;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.ProjectCategoryRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.security.WithMockAppUser;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@RunWith(SpringRunner.class)
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("dev")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
public class ProjectCreateIntegrationTest {

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

    private ProjectCategory projectCategory;

    @BeforeAll
    public void setUp() {
        projectRepos.deleteAll();
        accountRepos.deleteAll();
        accountRepos.save(
            Account.builder()
                .email("test@example.com")
                .firstName("Test")
                .lastName("User")
                .password("password")
                .role(Role.CLIENT)
                .isVerified(true)
                .isVisible(true)
                .build()
        );

        projectCategoryRepos.deleteAll();
        projectCategory = projectCategoryRepos.save(ProjectCategory.builder().name("Test").isVisible(true).build());
    }

    @Test
    @WithMockAppUser(accountId = 2, username = "test@example.com", role = "ROLE_CLIENT")
    public void testCreateProject_Success() throws Exception {
        ProjectCreateDto projectCreateDto = new ProjectCreateDto()
            .projectCategoryId(projectCategory.getProjectCategoryId())
            .title("Test Project")
            .description("Test Description")
            .minBudget(BigDecimal.valueOf(100))
            .maxBudget(BigDecimal.valueOf(200))
            .startDate(OffsetDateTime.now().plusDays(7))
            .milestones(Arrays.asList(
                new MilestoneCreateDto()
                    .title("Milestone 1")
                    .description("Description 1")
                    .budgetRatio(BigDecimal.valueOf(0.5))
                    .deadline(OffsetDateTime.now().plusDays(14)),
                new MilestoneCreateDto()
                    .title("Milestone 2")
                    .description("Description 2")
                    .budgetRatio(BigDecimal.valueOf(0.5))
                    .deadline(OffsetDateTime.now().plusDays(21))
            ));

        String response = mockMvc.perform(post("/api/v1/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(projectCreateDto)))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

        ProjectDto createdProject = objectMapper.readValue(response, ProjectDto.class);
        assertThat(createdProject.getTitle()).isEqualTo("Test Project");
        assertThat(createdProject.getStatus()).isEqualTo(ProjectStatusDto.OPEN);
        assertThat(createdProject.getMilestones()).hasSize(2);
    }

    @Test
    public void testCreateProject_Unauthorized() throws Exception {
        ProjectCreateDto projectCreateDto = new ProjectCreateDto()
            .projectCategoryId(projectCategory.getProjectCategoryId())
            .title("Test Project");

        mockMvc.perform(post("/api/v1/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(projectCreateDto)))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockAppUser(accountId = 2, username = "test@example.com", role = "ROLE_CLIENT")
    public void testCreateProject_InvalidBudget() throws Exception {
        ProjectCreateDto projectCreateDto = new ProjectCreateDto()
            .projectCategoryId(projectCategory.getProjectCategoryId())
            .title("Test Project")
            .description("Test Description")
            .minBudget(BigDecimal.valueOf(200))
            .maxBudget(BigDecimal.valueOf(100))
            .startDate(OffsetDateTime.now().plusDays(7))
            .milestones(Collections.singletonList(
                new MilestoneCreateDto()
                    .title("Milestone 1")
                    .budgetRatio(BigDecimal.ONE)
                    .deadline(OffsetDateTime.now().plusDays(14))
            ));

        mockMvc.perform(post("/api/v1/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(projectCreateDto)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockAppUser(accountId = 2, username = "test@example.com", role = "ROLE_CLIENT")
    public void testCreateProject_InvalidMilestoneBudgetRatio() throws Exception {
        ProjectCreateDto projectCreateDto = new ProjectCreateDto()
            .projectCategoryId(projectCategory.getProjectCategoryId())
            .title("Test Project")
            .description("Test Description")
            .minBudget(BigDecimal.valueOf(100))
            .maxBudget(BigDecimal.valueOf(200))
            .startDate(OffsetDateTime.now().plusDays(7))
            .milestones(Arrays.asList(
                new MilestoneCreateDto()
                    .title("Milestone 1")
                    .budgetRatio(BigDecimal.valueOf(0.3))
                    .deadline(OffsetDateTime.now().plusDays(14)),
                new MilestoneCreateDto()
                    .title("Milestone 2")
                    .budgetRatio(BigDecimal.valueOf(0.3))
                    .deadline(OffsetDateTime.now().plusDays(21))
            ));

        mockMvc.perform(post("/api/v1/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(projectCreateDto)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockAppUser(accountId = 2, username = "test@example.com", role = "ROLE_CLIENT")
    public void testCreateProject_InvalidStartDate() throws Exception {
        ProjectCreateDto projectCreateDto = new ProjectCreateDto()
            .projectCategoryId(projectCategory.getProjectCategoryId())
            .title("Test Project")
            .description("Test Description")
            .minBudget(BigDecimal.valueOf(100))
            .maxBudget(BigDecimal.valueOf(200))
            .startDate(OffsetDateTime.now()) // Start date too soon
            .milestones(Collections.singletonList(
                new MilestoneCreateDto()
                    .title("Milestone 1")
                    .budgetRatio(BigDecimal.ONE)
                    .deadline(OffsetDateTime.now().plusDays(14))
            ));

        mockMvc.perform(post("/api/v1/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(projectCreateDto)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockAppUser(accountId = 2, username = "test@example.com", role = "ROLE_CLIENT")
    public void testCreateProject_InvalidMilestoneDeadline() throws Exception {
        ProjectCreateDto projectCreateDto = new ProjectCreateDto()
            .projectCategoryId(projectCategory.getProjectCategoryId())
            .title("Test Project")
            .description("Test Description")
            .minBudget(BigDecimal.valueOf(100))
            .maxBudget(BigDecimal.valueOf(200))
            .startDate(OffsetDateTime.now().plusDays(7))
            .milestones(Collections.singletonList(
                new MilestoneCreateDto()
                    .title("Milestone 1")
                    .budgetRatio(BigDecimal.ONE)
                    .deadline(OffsetDateTime.now().plusDays(1)) // Deadline before start date
            ));

        mockMvc.perform(post("/api/v1/projects")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(projectCreateDto)))
            .andExpect(status().isBadRequest());
    }
}