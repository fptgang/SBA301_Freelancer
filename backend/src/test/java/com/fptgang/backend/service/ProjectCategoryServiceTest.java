package com.fptgang.backend.service;

import com.fptgang.backend.TestcontainersConfiguration;
import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.ProjectCategory;
import com.fptgang.backend.repository.ProjectCategoryRepos;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestConfiguration(proxyBeanMethods = false)
@Testcontainers
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@Import(TestcontainersConfiguration.class)
public class ProjectCategoryServiceTest {

    @Autowired
    private ProjectCategoryService projectCategoryService;

    @Autowired
    private ProjectCategoryRepos projectCategoryRepos;

    private ProjectCategory testCategory;

    @BeforeEach
    void setUp() {
        testCategory = new ProjectCategory();
        testCategory.setName("Test Category");
        testCategory.setVisible(true);
    }

    @AfterEach
    void tearDown() {
        projectCategoryRepos.deleteAll();
    }

    @Test
    @Order(1)
    void createProjectCategorySuccess() {
        // Act
        ProjectCategory createdCategory = projectCategoryService.create(testCategory);

        // Assert
        assertNotNull(createdCategory);
        assertNotNull(createdCategory.getProjectCategoryId());
        assertEquals("Test Category", createdCategory.getName());
    }

    @Test
    @Order(2)
    void updateProjectCategorySuccess() {
        // Arrange
        ProjectCategory savedCategory = projectCategoryService.create(testCategory);
        savedCategory.setName("Updated Category");

        // Act
        ProjectCategory updatedCategory = projectCategoryService.update(savedCategory);

        // Assert
        assertEquals("Updated Category", updatedCategory.getName());
    }

    @Test
    @Order(3)
    void updateProjectCategoryNotFound() {
        // Arrange
        testCategory.setProjectCategoryId(999L);

        // Act & Assert
        assertThrows(InvalidInputException.class, () -> projectCategoryService.update(testCategory));
    }

    @Test
    @Order(4)
    void findByProjectCategoryIdSuccess() {
        // Arrange
        ProjectCategory savedCategory = projectCategoryService.create(testCategory);

        // Act
        ProjectCategory foundCategory = projectCategoryService.findByProjectCategoryId(savedCategory.getProjectCategoryId());

        // Assert
        assertNotNull(foundCategory);
        assertEquals(savedCategory.getProjectCategoryId(), foundCategory.getProjectCategoryId());
    }

    @Test
    @Order(5)
    void findByProjectCategoryIdNotFound() {
        // Act & Assert
        assertThrows(InvalidInputException.class, () -> projectCategoryService.findByProjectCategoryId(999L));
    }

    @Test
    @Order(6)
    void deleteByIdSuccess() {
        // Arrange
        ProjectCategory savedCategory = projectCategoryService.create(testCategory);

        // Act
        projectCategoryService.deleteById(savedCategory.getProjectCategoryId());

        // Assert
        Optional<ProjectCategory> deletedCategory = projectCategoryRepos.findByProjectCategoryId(savedCategory.getProjectCategoryId());
        assertTrue(deletedCategory.isPresent());
        assertFalse(deletedCategory.get().isVisible());
    }

    @Test
    @Order(7)
    void getAllProjectCategories() {
        // Arrange
        for (int i = 1; i <= 3; i++) {
            ProjectCategory category = ProjectCategory.builder()
                    .name("Category " + i)
                    .isVisible(true)
                    .build();
            projectCategoryService.create(category);
        }

        Pageable pageable = PageRequest.of(0, 10);

        // Act
        Page<ProjectCategory> page = projectCategoryService.getAll(pageable, null);

        // Assert
        assertNotNull(page);
        assertEquals(3, page.getTotalElements());
    }
    @Order(8)
    @Test
    void getAllVisibleProjectCategories() {
        // Arrange
        for (int i = 1; i <= 3; i++) {
            ProjectCategory category = ProjectCategory.builder()
                    .name("Category " + i)
                    .isVisible(true)
                    .build();
            projectCategoryService.create(category);
        }
        ProjectCategory hiddenCategory = ProjectCategory.builder()
                .name("Hidden Category")
                .isVisible(false)
                .build();
        projectCategoryService.create(hiddenCategory);

        Pageable pageable = PageRequest.of(0, 10);

        // Act
        Page<ProjectCategory> page = projectCategoryService.getAllVisible(pageable, null);

        // Assert
        assertNotNull(page);
        assertEquals(3, page.getTotalElements());
    }

    @Order(9)
    @Test
    void getAllVisibleProjectCategoriesWithFilter() {
        // Arrange
        for (int i = 1; i <= 3; i++) {
            ProjectCategory category = ProjectCategory.builder()
                    .name("Category " + i)
                    .isVisible(true)
                    .build();
            projectCategoryService.create(category);
        }
        ProjectCategory hiddenCategory = ProjectCategory.builder()
                .name("Hidden Category")
                .isVisible(false)
                .build();
        projectCategoryService.create(hiddenCategory);

        Pageable pageable = PageRequest.of(0, 10);

        // Act
        Page<ProjectCategory> page = projectCategoryService.getAllVisible(pageable, "name,contains,Category");

        // Assert
        assertNotNull(page);
        assertEquals(3, page.getTotalElements());
    }
}
