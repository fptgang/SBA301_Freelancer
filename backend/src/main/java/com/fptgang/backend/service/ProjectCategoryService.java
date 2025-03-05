package com.fptgang.backend.service;

import com.fptgang.backend.model.ProjectCategory;
import com.fptgang.backend.service.params.ListParams;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProjectCategoryService {
    ProjectCategory create(ProjectCategory projectCategory);
    ProjectCategory update(ProjectCategory projectCategory);
    ProjectCategory findByProjectCategoryId(long projectCategoryId);
    void deleteById(long projectCategoryId);
    Page<ProjectCategory> getAll(ListParams params);
}
