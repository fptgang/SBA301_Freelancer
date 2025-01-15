package com.fptgang.backend.service.impl;

import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.ProjectCategory;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.repository.ProjectCategoryRepos;
import com.fptgang.backend.service.ProjectCategoryService;
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
        return projectCategoryRepos.save(projectCategory);
    }

    @Override
    public ProjectCategory update(ProjectCategory projectCategory) {
        log.info("update prjCate");
        if (projectCategory.getProjectCategoryId() == null || !projectCategoryRepos.existsById(projectCategory.getProjectCategoryId())) {
            throw new InvalidInputException("Project Category does not exist");
        }
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
        projectCategory.setVisible(false);
        projectCategoryRepos.save(projectCategory);
    }

    @Override
    public Page<ProjectCategory> getAll(Pageable pageable, String filter, Role role) {
        var spec = OpenApiHelper.<ProjectCategory>toSpecification(filter);
        if (role.equals(Role.ADMIN)) {
            log.info("Admin");
            return projectCategoryRepos.findAll(spec, pageable);
        } else {
            log.info("not Admin");
            return projectCategoryRepos.findAllByVisibleTrue(pageable, spec);
        }
    }
}
