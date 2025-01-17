package com.fptgang.backend.service;

import com.fptgang.backend.TestcontainersConfiguration;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.model.ProjectCategory;
import com.fptgang.backend.repository.ProjectCategoryRepos;
import com.fptgang.backend.repository.ProjectRepos;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestConfiguration(proxyBeanMethods = false)
@Testcontainers
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@Import(TestcontainersConfiguration.class)
class ProjectServiceTest {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private ProjectRepos projectRepos;

    @Autowired
    private ProjectCategoryRepos categoryRepos;

    private Project testProject;
    private ProjectCategory testCategory;

    @BeforeEach
    void setUp() {
        // First create and save the category
        testCategory = new ProjectCategory();
        testCategory.setName("Test Category");
        testCategory = categoryRepos.save(testCategory);

        // Then create the project with the saved category
        testProject = new Project();
        testProject.setTitle("Test Project");
        testProject.setDescription("Test Description");
        testProject.setCategory(testCategory);
        // Set other necessary fields
    }

    @AfterEach
    void tearDown() {
        projectRepos.deleteAll();
        categoryRepos.deleteAll();
    }

    @Test
    @Order(1)
    @Disabled
    void createProjectSuccess() {
        // Act
        Project createdProject = projectService.create(testProject);

        // Assert
        assertNotNull(createdProject);
        assertNotNull(createdProject.getProjectId());
        assertEquals("Test Project", createdProject.getTitle());
        assertEquals("Test Description", createdProject.getDescription());
        assertNotNull(createdProject.getCategory());
        assertEquals(testCategory.getName(), createdProject.getCategory().getName());
    }

    @Test
    @Order(2)
    @Disabled
    void updateProjectSuccess() {
        // Arrange
        Project savedProject = projectService.create(testProject);

        // Create and save a new category for update
        ProjectCategory newCategory = new ProjectCategory();
        newCategory.setName("Updated Category");
        newCategory = categoryRepos.save(newCategory);

        savedProject.setTitle("Updated Project Name");
        savedProject.setDescription("Updated Description");
        savedProject.setCategory(newCategory);

        // Act
        projectService.update(savedProject);

        // Assert
        Project updatedProject = projectService.findByProjectId(savedProject.getProjectId());
        assertEquals("Updated Project Name", updatedProject.getTitle());
        assertEquals("Updated Description", updatedProject.getDescription());
        assertEquals(newCategory.getName(), updatedProject.getCategory().getName());
    }

    @Test
    @Order(3)
    //ignore test annotation
    @Disabled
    void findByProjectIdSuccess() {
        // Arrange
        Project savedProject = projectService.create(testProject);

        // Act
        Project foundProject = projectService.findByProjectId(savedProject.getProjectId());

        // Assert
        assertNotNull(foundProject);
        assertEquals(savedProject.getProjectId(), foundProject.getProjectId());
        assertEquals(savedProject.getTitle(), foundProject.getTitle());
        assertNotNull(foundProject.getCategory());
        assertEquals(testCategory.getName(), foundProject.getCategory().getName());
    }

    @Test
    @Order(4)
    void findByProjectIdNotFound() {
        // Act & Assert
        assertThrows(RuntimeException.class, () -> projectService.findByProjectId(999L));
    }

    @Test
    @Order(5)
    @Disabled
    void deleteByIdSuccess() {
        // Arrange
        Project savedProject = projectService.create(testProject);

        // Act
        projectService.deleteById(savedProject.getProjectId());

        // Assert
        assertThrows(RuntimeException.class, () -> projectService.findByProjectId(savedProject.getProjectId()));
    }

    @Test
    @Order(6)
    @Disabled
    void getAllProjectsNoFilter() {
        // Arrange
        for (int i = 0; i < 3; i++) {
            Project project = new Project();
            project.setTitle("Test Project " + i);
            project.setDescription("Description " + i);
            project.setCategory(testCategory);  // Use the saved category
            projectService.create(project);
        }

        Pageable pageable = PageRequest.of(0, 10);

        // Act
        Page<Project> projectPage = projectService.getAll(pageable, null);

        // Assert
        assertNotNull(projectPage);
        assertTrue(projectPage.getTotalElements() >= 3);
        assertEquals(0, projectPage.getNumber());
        projectPage.getContent().forEach(project ->
                assertNotNull(project.getCategory()));
    }

    @Test
    @Order(7)
    @Disabled
    void getAllProjectsWithFilter() {
        // Arrange
        Project specificProject = new Project();
        specificProject.setTitle("Specific Project");
        specificProject.setDescription("Specific Description");
        specificProject.setCategory(testCategory);  // Use the saved category
        projectService.create(specificProject);

        Pageable pageable = PageRequest.of(0, 10);

        // Act
        Page<Project> projectPage = projectService.getAll(pageable, "Specific");

        // Assert
        assertNotNull(projectPage);
        assertTrue(projectPage.getTotalElements() >= 1);
        assertTrue(projectPage.getContent().stream()
                .anyMatch(p -> p.getTitle().contains("Specific") ||
                        p.getDescription().contains("Specific")));
    }

    @Test
    @Order(8)
    void createProjectWithNullCategory() {
        // Arrange
        testProject.setCategory(null);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> projectService.create(testProject));
    }

    @Test
    @Order(9)
    void createProjectWithNonExistentCategory() {
        // Arrange
        ProjectCategory nonExistentCategory = new ProjectCategory();
        nonExistentCategory.setName("Non Existent");
        testProject.setCategory(nonExistentCategory);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> projectService.create(testProject));
    }
}