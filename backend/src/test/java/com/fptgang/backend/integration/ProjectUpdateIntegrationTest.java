package com.fptgang.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fptgang.backend.TestcontainersConfiguration;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.model.ProjectCategory;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.ProjectCategoryRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.security.WithMockAppUser;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@RunWith(SpringRunner.class)
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("dev")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class ProjectUpdateIntegrationTest {

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
    private Project existingProject;
    private Account clientAccount;

    @BeforeAll
    public void setUp() {
        accountRepos.deleteAll();
        clientAccount = accountRepos.save(
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

        existingProject = Project.builder()
            .title("Original Title")
            .description("Original Description")
            .minBudget(BigDecimal.valueOf(100))
            .maxBudget(BigDecimal.valueOf(200))
            .startDate(LocalDateTime.now().plusDays(7))
            .status(Project.ProjectStatus.OPEN)
            .client(clientAccount)
            .category(projectCategory)
            .isVisible(true)
            .build();
        existingProject = projectRepos.save(existingProject);
    }

    @Test
    @WithMockAppUser(accountId = 1, username = "test@example.com", role = "ROLE_CLIENT")
    public void testUpdateProject_Success() throws Exception {
        ProjectUpdateDto updateDto = new ProjectUpdateDto()
            .title("Updated Title")
            .description("Updated Description")
            .minBudget(BigDecimal.valueOf(150))
            .maxBudget(BigDecimal.valueOf(250))
            .startDate(OffsetDateTime.now().plusDays(8))
            .milestones(Arrays.asList(
                new MilestoneUpdateDto()
                    .title("Updated Milestone 1")
                    .description("Updated Description 1")
                    .budgetRatio(BigDecimal.valueOf(0.5))
                    .deadline(OffsetDateTime.now().plusDays(15)),
                new MilestoneUpdateDto()
                    .title("Updated Milestone 2")
                    .description("Updated Description 2")
                    .budgetRatio(BigDecimal.valueOf(0.5))
                    .deadline(OffsetDateTime.now().plusDays(22))
            ));

        String response = mockMvc.perform(put("/api/v1/projects/" + existingProject.getProjectId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

        ProjectDto updatedProject = objectMapper.readValue(response, ProjectDto.class);
        assertThat(updatedProject.getTitle()).isEqualTo("Updated Title");
        assertThat(updatedProject.getDescription()).isEqualTo("Updated Description");
        assertThat(updatedProject.getMilestones()).hasSize(2);
    }

    @Test
    public void testUpdateProject_Unauthorized() throws Exception {
        ProjectUpdateDto updateDto = new ProjectUpdateDto()
            .title("Updated Title");

        mockMvc.perform(put("/api/v1/projects/" + existingProject.getProjectId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockAppUser(accountId = 2, username = "other@example.com", role = "ROLE_CLIENT")
    public void testUpdateProject_WrongClient() throws Exception {
        ProjectUpdateDto updateDto = new ProjectUpdateDto()
            .title("Updated Title");

        mockMvc.perform(put("/api/v1/projects/" + existingProject.getProjectId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockAppUser(accountId = 1, username = "test@example.com", role = "ROLE_CLIENT")
    public void testUpdateProject_InvalidBudget() throws Exception {
        ProjectUpdateDto updateDto = new ProjectUpdateDto()
            .minBudget(BigDecimal.valueOf(300))
            .maxBudget(BigDecimal.valueOf(200));

        mockMvc.perform(put("/api/v1/projects/" + existingProject.getProjectId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockAppUser(accountId = 1, username = "test@example.com", role = "ROLE_CLIENT")
    public void testUpdateProject_InvalidMilestoneBudgetRatio() throws Exception {
        ProjectUpdateDto updateDto = new ProjectUpdateDto()
            .milestones(Arrays.asList(
                new MilestoneUpdateDto()
                    .title("Milestone 1")
                    .budgetRatio(BigDecimal.valueOf(0.3))
                    .deadline(OffsetDateTime.now().plusDays(14)),
                new MilestoneUpdateDto()
                    .title("Milestone 2")
                    .budgetRatio(BigDecimal.valueOf(0.3))
                    .deadline(OffsetDateTime.now().plusDays(21))
            ));

        mockMvc.perform(put("/api/v1/projects/" + existingProject.getProjectId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockAppUser(accountId = 1, username = "test@example.com", role = "ROLE_CLIENT")
    public void testUpdateProject_InvalidStartDate() throws Exception {
        ProjectUpdateDto updateDto = new ProjectUpdateDto()
            .startDate(OffsetDateTime.now().minusDays(1));

        mockMvc.perform(put("/api/v1/projects/" + existingProject.getProjectId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockAppUser(accountId = 1, username = "test@example.com", role = "ROLE_CLIENT")
    public void testUpdateProject_InvalidMilestoneDeadline() throws Exception {
        ProjectUpdateDto updateDto = new ProjectUpdateDto()
            .startDate(OffsetDateTime.now().plusDays(7))
            .milestones(Arrays.asList(
                new MilestoneUpdateDto()
                    .title("Milestone 1")
                    .budgetRatio(BigDecimal.ONE)
                    .deadline(OffsetDateTime.now().plusDays(1))
            ));

        mockMvc.perform(put("/api/v1/projects/" + existingProject.getProjectId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockAppUser(accountId = 1, username = "test@example.com", role = "ROLE_CLIENT")
    public void testUpdateProject_NonExistentProject() throws Exception {
        ProjectUpdateDto updateDto = new ProjectUpdateDto()
            .title("Updated Title");

        mockMvc.perform(put("/api/v1/projects/99999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
            .andExpect(status().isNotFound());
    }
}