package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.ProjectsApi;
import com.fptgang.backend.api.model.GetAccountsPageableParameter;
import com.fptgang.backend.api.model.GetProjects200Response;
import com.fptgang.backend.api.model.ProjectDto;
import com.fptgang.backend.mapper.ProjectMapper;
import com.fptgang.backend.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/projects")
public class ProjectController implements ProjectsApi {

    private ProjectService projectService;
    private ProjectMapper projectMapper;

    @Autowired
    public ProjectController(ProjectService projectService, ProjectMapper projectMapper) {
        this.projectService = projectService;
        this.projectMapper = projectMapper;
    }




    @PostMapping
    public ResponseEntity<ProjectDto> createProject(ProjectDto projectDto) {
        ProjectDto response = projectMapper
                .toDTO(projectService
                        .create(projectMapper.toEntity(projectDto)));
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<Void> deleteProject(Integer projectId) {
        return ProjectsApi.super.deleteProject(projectId);
    }

    @Override
    public ResponseEntity<ProjectDto> getProjectById(String projectId) {
        return ProjectsApi.super.getProjectById(projectId);
    }

    @Override
    public ResponseEntity<GetProjects200Response> getProjects(GetAccountsPageableParameter pageable, String filter) {
        return ProjectsApi.super.getProjects(pageable, filter);
    }

    @Override
    public ResponseEntity<ProjectDto> updateProject(String projectId, ProjectDto projectDto) {
        return ProjectsApi.super.updateProject(projectId, projectDto);
    }

    @PostMapping("/{projectId}")
    public ResponseEntity<Void> deleteProjectById(@PathVariable long projectId) {
        ResponseEntity<Void> response = new ResponseEntity<Void>( HttpStatus.OK);
        projectService.deleteById(projectId);
        return response;
    }



}
