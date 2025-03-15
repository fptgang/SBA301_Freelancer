package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.ProjectsApi;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.mapper.*;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.service.ProjectService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.OpenApiHelper;
import com.fptgang.backend.util.SecurityUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    private final ProjectUpdateMapper projectUpdateMapper;
    private final ProjectTimelineMapper projectTimelineMapper;

    @Autowired
    public ProjectController(ProjectService projectService,
                             ProjectMapper projectMapper,
                             ProjectCreateMapper projectCreateMapper,
                             ProjectUpdateMapper projectUpdateMapper,
                             ProjectTimelineMapper projectTimelineMapper) {
        this.projectService = projectService;
        this.projectMapper = projectMapper;
        this.projectCreateMapper = projectCreateMapper;
        this.projectUpdateMapper = projectUpdateMapper;
        this.projectTimelineMapper = projectTimelineMapper;
    }

    @Override
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectDto> createProject(ProjectCreateDto projectCreateDto) {
        return ResponseEntity.ok(
                projectMapper.toDTO(
                        projectService.create(projectCreateMapper.toEntity(projectCreateDto)),
                        DetailLevel.FULL
                )
        );
    }

    @Override
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteProject(Long projectId) {
        projectService.deleteById(projectId);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<ProjectDto> getProjectById(Long projectId) {
        Project project = projectService.findByProjectId(projectId);
        var userId = SecurityUtil.getCurrentUserId();
        if (SecurityUtil.hasPermission(Role.STAFF) ||
                Objects.equals(project.getClientId(), userId) ||
                (project.getContract() != null && Objects.equals(project.getContract().getFreelancerId(), userId))
        ) {
            return ResponseEntity.ok(projectMapper.toDTO(project, DetailLevel.FULL));

        }
        return ResponseEntity.ok(projectMapper.toDTO(project, DetailLevel.SUMMARY));
    }

    @Override
    public ResponseEntity<GetProjects200Response> getProjects(Pageable pageable, String filter, String search, String type) {
        log.info("Getting projects");
        var page = OpenApiHelper.toPageable(pageable);
        var includeInvisible = SecurityUtil.hasPermission(Role.ADMIN);
        Long participantId = SecurityUtil.getCurrentUserId();
        if (type != null && type.equalsIgnoreCase("chat")) {
            var res = projectService.getProjectsSortedByLatestMessage(page, includeInvisible, participantId).map(
                    project -> projectMapper.toDTO(project, DetailLevel.FULL)
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
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectDto> updateProject(Long projectId, ProjectUpdateDto projectDto) {
        var project = projectUpdateMapper.toEntity(projectDto);
        project.setProjectId(projectId);
        project = projectService.update(project);
        return ResponseEntity.ok(
                projectMapper.toDTO(
                        project,
                        DetailLevel.FULL
                )
        );
    }

    @Override
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectDto> extendProjectDeadline(Long projectId, ProjectTimelineDto projectTimelineDto) {
        projectTimelineDto.setNewStartDate(null); // don't troll
        var timeline = projectTimelineMapper.toEntity(projectTimelineDto);
        return ResponseEntity.ok(
                projectMapper.toDTO(projectService.extendDeadline(projectId, timeline), DetailLevel.FULL)
        );
    }

    @Override
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectDto> terminateProject(Long projectId) {
        return ResponseEntity.ok(
                projectMapper.toDTO(
                        projectService.terminateByClient(projectId),
                        DetailLevel.FULL
                )
        );
    }

    @Override
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProjectDto> unpauseProject(Long projectId, ProjectTimelineDto projectTimelineDto) {
        var timeline = projectTimelineMapper.toEntity(projectTimelineDto);
        return ResponseEntity.ok(
                projectMapper.toDTO(
                        projectService.unpause(projectId, timeline),
                        DetailLevel.FULL
                )
        );
    }

    @Override
    public ResponseEntity<ProjectDto> joinProject(Long projectId) {
        if (!SecurityUtil.hasPermission(Role.STAFF)) {
            throw new RuntimeException("You are not a staff");
        }
        Project project = projectService.joinProject(projectId, SecurityUtil.getCurrentUserId());
        return ResponseEntity.ok(projectMapper.toDTO(project, DetailLevel.FULL));
    }

    @Override
    public ResponseEntity<ProjectDto> leaveProject(Long projectId) {
        if (!SecurityUtil.hasPermission(Role.STAFF)) {
            throw new RuntimeException("You are not a staff");
        }
        Project project = projectService.leaveProject(projectId, SecurityUtil.getCurrentUserId());
        return ResponseEntity.ok(projectMapper.toDTO(project, DetailLevel.FULL));
    }
}
