package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.ProjectCategoriesApi;
import com.fptgang.backend.api.model.GetAccountsPageableParameter;
import com.fptgang.backend.api.model.GetProjectCategories200Response;
import com.fptgang.backend.api.model.ProjectCategoryDto;
import com.fptgang.backend.mapper.ProjectCategoryMapper;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.service.AccountService;
import com.fptgang.backend.service.ProjectCategoryService;
import com.fptgang.backend.util.OpenApiHelper;
import com.fptgang.backend.util.SecurityUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1")
public class ProjectCategoryController implements ProjectCategoriesApi {

    private final ProjectCategoryService projectCategoryService;
    private final ProjectCategoryMapper projectCategoryMapper;
    private final AccountService accountService;

    @Autowired
    public ProjectCategoryController(ProjectCategoryService projectCategoryService, ProjectCategoryMapper projectCategoryMapper, AccountService accountService) {
        this.projectCategoryService = projectCategoryService;
        this.projectCategoryMapper = projectCategoryMapper;
        this.accountService = accountService;
    }

    @Override
    public ResponseEntity<ProjectCategoryDto> createProjectCategory(ProjectCategoryDto projectCategoryDto) {
        var projectCategory = projectCategoryMapper.toEntity(projectCategoryDto);
        return new ResponseEntity<>(projectCategoryMapper.toDTO(projectCategoryService.create(projectCategory)), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Void> deleteProjectCategory(Long projectCategoryId) {
        projectCategoryService.deleteById(projectCategoryId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<GetProjectCategories200Response> getProjectCategories(GetAccountsPageableParameter pageable, String filter) {

        var page = OpenApiHelper.toPageable(pageable);
        Page<ProjectCategoryDto> res;
        if (Role.ADMIN.hasPermission(SecurityUtil.getCurrentUserRole())) {
            res = projectCategoryService.getAll(page, filter).map(projectCategoryMapper::toDTO);
        } else
            res = projectCategoryService.getAllVisible(page, filter).map(projectCategoryMapper::toDTO);
        return OpenApiHelper.respondPage(res, GetProjectCategories200Response.class);
    }

    @Override
    public ResponseEntity<ProjectCategoryDto> getProjectCategoryById(Long projectCategoryId) {
        return new ResponseEntity<>(projectCategoryMapper.toDTO(projectCategoryService.findByProjectCategoryId(projectCategoryId)), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<ProjectCategoryDto> updateProjectCategory(Long projectCategoryId, ProjectCategoryDto projectCategoryDto) {
        return new ResponseEntity<>(projectCategoryMapper.toDTO(projectCategoryService.update(projectCategoryMapper.toEntity(projectCategoryDto))), HttpStatus.OK);
    }
}
