package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.ProjectsApi;
import com.fptgang.backend.api.model.GetAccounts200Response;
import com.fptgang.backend.api.model.GetAccountsPageableParameter;
import com.fptgang.backend.api.model.GetProjects200Response;
import com.fptgang.backend.api.model.ProjectDto;
import com.fptgang.backend.mapper.ProjectMapper;
import com.fptgang.backend.service.ProjectService;
import com.fptgang.backend.util.OpenApiHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1")
@Slf4j
public class ProjectController implements ProjectsApi {
    private final ProjectService projectService;
    private final ProjectMapper projectMapper;

    @Autowired
    public ProjectController(ProjectService projectService, ProjectMapper projectMapper) {
        this.projectService = projectService;
        this.projectMapper = projectMapper;
    }


    @Override
    public ResponseEntity<ProjectDto> createProject(ProjectDto projectDto) {
        return ResponseEntity.ok(projectMapper.toDTO(projectService.create(projectMapper.toEntity(projectDto))));
    }

    @Override
    public ResponseEntity<Void> deleteProject(Integer projectId) {
        projectService.deleteById(projectId);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<ProjectDto> getProjectById(Integer projectId) {
        return ResponseEntity.ok(projectMapper.toDTO(projectService.findByProjectId(projectId)));
    }

    @Override
    public ResponseEntity<GetProjects200Response> getProjects(GetAccountsPageableParameter pageable, String filter) {
        log.info("Getting accounts");
        var page = OpenApiHelper.toPageable(pageable);
        var res = projectService.getAll(page, filter).map(projectMapper::toDTO);
        return OpenApiHelper.respondPage(res, GetProjects200Response.class);
    }

    @Override
    public ResponseEntity<ProjectDto> updateProject(Integer projectId, ProjectDto projectDto) {
        return ResponseEntity.ok(projectMapper.toDTO(projectService.update(projectMapper.toEntity(projectDto))));

    }
}
