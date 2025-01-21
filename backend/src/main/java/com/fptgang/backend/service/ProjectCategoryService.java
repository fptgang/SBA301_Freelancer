package com.fptgang.backend.service;

import com.fptgang.backend.model.ProjectCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProjectCategoryService {
    ProjectCategory create(ProjectCategory projectCategory);
    ProjectCategory update(ProjectCategory projectCategory);
    ProjectCategory findByProjectCategoryId(long projectCategoryId);
    void deleteById(long projectCategoryId);
    Page<ProjectCategory> getAll(Pageable pageable, String filter, String search, boolean includeInvisible);
    default Page<ProjectCategory> getAll(Pageable pageable, String filter, String search) {
        return getAll(pageable, filter, search, false);
    }
    default Page<ProjectCategory> getAll(Pageable pageable, String filter) {
        return getAll(pageable, filter, null, false);
    }
}
