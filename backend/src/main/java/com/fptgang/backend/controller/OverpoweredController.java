package com.fptgang.backend.controller;

import com.fptgang.backend.model.Role;
import com.fptgang.backend.service.ProjectService;
import com.fptgang.backend.util.SecurityUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/op")
public class OverpoweredController {
    private final ProjectService projectService;

    public OverpoweredController(ProjectService projectService) {
        this.projectService = projectService;
    }

    /*

    void pauseProjectsWithNoProposalChosen();
    void terminateProjectsWithUnsignedContract();
    void terminateProjectsPerClientRequest();
    void verifyAccounts();
     */

    @GetMapping("/task/pause-project")
    public ResponseEntity<String> runTask1() {
        if (!SecurityUtil.hasRole(Role.ADMIN)) {
            throw new AccessDeniedException("No access");
        }

        projectService.pauseProjectsWithNoProposalChosen();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/task/unsigned-contract-project")
    public ResponseEntity<String> runTask2() {
        if (!SecurityUtil.hasRole(Role.ADMIN)) {
            throw new AccessDeniedException("No access");
        }

        projectService.terminateProjectsWithUnsignedContract();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/task/scheduled-project-terminates")
    public ResponseEntity<String> runTask3() {
        if (!SecurityUtil.hasRole(Role.ADMIN)) {
            throw new AccessDeniedException("No access");
        }

        projectService.terminateProjectsPerClientRequest();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/task/verify-accounts")
    public ResponseEntity<String> runTask4() {
        if (!SecurityUtil.hasRole(Role.ADMIN)) {
            throw new AccessDeniedException("No access");
        }

        projectService.verifyAccounts();
        return ResponseEntity.noContent().build();
    }
}
