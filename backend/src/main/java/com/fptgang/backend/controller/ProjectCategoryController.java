package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.ProjectCategoriesApi;
import com.fptgang.backend.api.model.GetProjectCategories200Response;
import com.fptgang.backend.api.model.Pageable;
import com.fptgang.backend.api.model.ProjectCategoryDto;
import com.fptgang.backend.mapper.DetailLevel;
import com.fptgang.backend.mapper.ProjectCategoryMapper;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.service.ProjectCategoryService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.OpenApiHelper;
import com.fptgang.backend.util.SecurityUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1")
public class ProjectCategoryController implements ProjectCategoriesApi {

    private final ProjectCategoryService projectCategoryService;
    private final ProjectCategoryMapper projectCategoryMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public ProjectCategoryController(ProjectCategoryService projectCategoryService,
                                     ProjectCategoryMapper projectCategoryMapper,
                                     SimpMessagingTemplate messagingTemplate) {
        this.projectCategoryService = projectCategoryService;
        this.projectCategoryMapper = projectCategoryMapper;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public ResponseEntity<ProjectCategoryDto> createProjectCategory(ProjectCategoryDto projectCategoryDto) {
        var projectCategory = projectCategoryService.create(projectCategoryMapper.toEntity(projectCategoryDto));
        messagingTemplate.convertAndSend("resources/projectCategories", projectCategoryMapper.toDTO(projectCategory, DetailLevel.FULL
        ));
        return new ResponseEntity<>(projectCategoryMapper.toDTO(projectCategory,DetailLevel.FULL), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Void> deleteProjectCategory(Long projectCategoryId) {
        projectCategoryService.deleteById(projectCategoryId);
        messagingTemplate.convertAndSend("resources/projectCategories", "Deleted projectCategory " + projectCategoryId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<GetProjectCategories200Response> getProjectCategories(Pageable pageable, String filter, String search) {
        var page = OpenApiHelper.toPageable(pageable);
        var includeInvisible = SecurityUtil.hasPermission(Role.ADMIN);
        var params = ListParams.builder()
                .pageable(page)
                .search(search)
                .filter(filter)
                .includeInvisible(includeInvisible);
        var res = projectCategoryService
                .getAll(params.build())
                .map(projectCategory -> projectCategoryMapper.toDTO(projectCategory, DetailLevel.SUMMARY));
        return OpenApiHelper.respondPage(res, GetProjectCategories200Response.class);
    }

    @Override
    public ResponseEntity<ProjectCategoryDto> getProjectCategoryById(Long projectCategoryId) {
        return new ResponseEntity<>(projectCategoryMapper.toDTO(projectCategoryService.findByProjectCategoryId(projectCategoryId),DetailLevel.FULL), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<ProjectCategoryDto> updateProjectCategory(Long projectCategoryId, ProjectCategoryDto projectCategoryDto) {
        projectCategoryDto.setProjectCategoryId(projectCategoryId); // Override projectCategoryId
        messagingTemplate.convertAndSend("resources/projectCategories", projectCategoryDto);
        return new ResponseEntity<>(projectCategoryMapper.toDTO(projectCategoryService.update(projectCategoryMapper.toEntity(projectCategoryDto)),DetailLevel.FULL), HttpStatus.OK);
    }
}
