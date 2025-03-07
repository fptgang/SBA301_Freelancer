package com.fptgang.backend.service.impl;

import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.ProjectCategory;
import com.fptgang.backend.repository.ProjectCategoryRepos;
import com.fptgang.backend.service.ProjectCategoryService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.EntityUtil;
import com.fptgang.backend.util.OpenApiHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class ProjectCategoryServiceImpl implements ProjectCategoryService {

    private final ProjectCategoryRepos projectCategoryRepos;

    @Autowired
    public ProjectCategoryServiceImpl(ProjectCategoryRepos projectCategoryRepos) {
        this.projectCategoryRepos = projectCategoryRepos;
    }

    @Override
    public ProjectCategory create(ProjectCategory projectCategory) {
        projectCategory.setProjectCategoryId(null);
        return projectCategoryRepos.save(projectCategory);
    }

    @Override
    public ProjectCategory update(ProjectCategory projectCategory) {
        log.info("update prjCate");
        if (projectCategory.getProjectCategoryId() == null ) {
            throw new InvalidInputException("Project Category does not exist");
        }
        var existing = projectCategoryRepos.findByProjectCategoryId(projectCategory.getProjectCategoryId()).orElseThrow(
                () -> new InvalidInputException("Project Category does not exist"));
        EntityUtil.merge(existing, projectCategory);
        return projectCategoryRepos.save(projectCategory);
    }

    @Override
    public ProjectCategory findByProjectCategoryId(long projectCategoryId) {
        log.info("find category");
        return projectCategoryRepos.findByProjectCategoryId(projectCategoryId).orElseThrow(
                () -> new InvalidInputException("Project Category with id " + projectCategoryId + "not found"));
    }

    @Override
    public void deleteById(long projectCategoryId) {
        ProjectCategory projectCategory = projectCategoryRepos.findByProjectCategoryId(projectCategoryId).orElseThrow(
                () -> new InvalidInputException("Project Category with id " + projectCategoryId + "not found"));
        projectCategory.setIsVisible(false);
        projectCategoryRepos.save(projectCategory);
    }

    @Override
    public Page<ProjectCategory> getAll(ListParams params) {
        var spec = OpenApiHelper.groupBy( params.<ProjectCategory>toSpec(), "projectCategoryId");
        return projectCategoryRepos.findAll(spec, params.getPageable());
    }
}
