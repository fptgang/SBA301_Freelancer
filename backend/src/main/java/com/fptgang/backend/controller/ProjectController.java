package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.ProjectsApi;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.mapper.DetailLevel;
import com.fptgang.backend.mapper.ProjectCreateMapper;
import com.fptgang.backend.mapper.ProjectDeadlineExtendMapper;
import com.fptgang.backend.mapper.ProjectMapper;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.service.ProjectService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.OpenApiHelper;
import com.fptgang.backend.util.SecurityUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Objects;

@RestController
@RequestMapping("api/v1")
@Slf4j
public class ProjectController implements ProjectsApi {
    private final ProjectService projectService;
    private final ProjectMapper projectMapper;
    private final ProjectCreateMapper projectCreateMapper;
    private final ProjectDeadlineExtendMapper projectDeadlineExtendMapper;

    @Autowired
    public ProjectController(ProjectService projectService,
                             ProjectMapper projectMapper,
                             ProjectCreateMapper projectCreateMapper,
                             ProjectDeadlineExtendMapper projectDeadlineExtendMapper) {
        this.projectService = projectService;
        this.projectMapper = projectMapper;
        this.projectCreateMapper = projectCreateMapper;
        this.projectDeadlineExtendMapper = projectDeadlineExtendMapper;
    }

    @Override
    public ResponseEntity<ProjectDto> createProject(ProjectCreateDto projectCreateDto) {
        return ProjectsApi.super.createProject(projectCreateDto);
    }

    @Override
    public ResponseEntity<Void> deleteProject(Long projectId) {
        projectService.deleteById(projectId);
        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity<ProjectDto> getProjectById(Long projectId) {
        Project project = projectService.findByProjectId(projectId);
        return ResponseEntity.ok(projectMapper.toDTO(project, DetailLevel.FULL));
    }

    @Override
    public ResponseEntity<GetProjects200Response> getProjects(Pageable pageable, String filter, String search,String type) {
        log.info("Getting projects");
        var page = OpenApiHelper.toPageable(pageable);
        var includeInvisible = SecurityUtil.hasPermission(Role.ADMIN);
        Long participantId = SecurityUtil.getCurrentUserId();
        if(type!=null && type.equalsIgnoreCase("chat")){
            var res = projectService.getProjectsSortedByLatestMessage(page,includeInvisible,participantId).map(
                    project -> projectMapper.toDTO(project, DetailLevel.SUMMARY)
            );
            return OpenApiHelper.respondPage(res, GetProjects200Response.class);
        }
        var params = ListParams.builder()
                .pageable(page)
                .search(search)
                .filter(filter)
                .includeInvisible(includeInvisible);
        var res = projectService
                .getAll(params.build())
                .map(project -> projectMapper.toDTO(project, DetailLevel.SUMMARY));
        return OpenApiHelper.respondPage(res, GetProjects200Response.class);
    }

    @Override
    public ResponseEntity<ProjectDto> updateProject(Long projectId, ProjectDto projectDto) {
        projectDto.setProjectId(projectId); // Override projectId

        return ResponseEntity.ok(projectMapper.toDTO(projectService.update(projectMapper.toEntity(projectDto)), DetailLevel.FULL));
    }

    @Override
    public ResponseEntity<ProjectDto> extendProjectDeadline(Long projectId, ProjectDeadlineExtendDto projectDeadlineExtendDto) {
        projectDeadlineExtendDto.setProjectId(projectId);
        return ProjectsApi.super.extendProjectDeadline(projectId, projectDeadlineExtendDto);
    }

    @Override
    public ResponseEntity<ProjectDto> terminateProject(Long projectId) {
        return new ResponseEntity<>(projectMapper.toDTO(projectService.terminateByClient(projectService.findByProjectId(projectId)),DetailLevel.FULL), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<ProjectDto> unpauseProject(Long projectId) {
        return new ResponseEntity<>(projectMapper.toDTO(projectService.unpause(projectService.findByProjectId(projectId)),DetailLevel.FULL), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<ProjectDto> joinProject(Long projectId) {
        if(!SecurityUtil.hasPermission(Role.STAFF)){
            throw new RuntimeException("You are not a staff");
        }
        Project project = projectService.joinProject(projectId, SecurityUtil.getCurrentUserId());
        return ResponseEntity.ok(projectMapper.toDTO(project, DetailLevel.FULL));
    }

    @Override
    public ResponseEntity<ProjectDto> leaveProject(Long projectId) {
        if(!SecurityUtil.hasPermission(Role.STAFF)){
            throw new RuntimeException("You are not a staff");
        }
        Project project = projectService.leaveProject(projectId, SecurityUtil.getCurrentUserId());
        return ResponseEntity.ok(projectMapper.toDTO(project, DetailLevel.FULL));
    }
}
