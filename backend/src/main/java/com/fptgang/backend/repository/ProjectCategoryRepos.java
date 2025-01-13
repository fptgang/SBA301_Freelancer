package com.fptgang.backend.repository;

import com.fptgang.backend.model.ProjectCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface ProjectCategoryRepos extends JpaRepository<ProjectCategory,Long> {
    Optional<ProjectCategory> findByProjectCategoryId(Long projectCateId);
}
