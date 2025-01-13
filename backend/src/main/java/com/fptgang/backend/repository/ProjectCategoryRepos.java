package com.fptgang.backend.repository;

import com.fptgang.backend.model.ProjectCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProjectCategoryRepos extends JpaRepository<ProjectCategory,Long> {
    Optional<ProjectCategory> findByProjectCategoryId(Long projectCateId);
}
