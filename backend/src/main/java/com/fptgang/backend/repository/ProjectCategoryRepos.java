package com.fptgang.backend.repository;


import com.fptgang.backend.model.ProjectCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface ProjectCategoryRepos extends JpaRepository<ProjectCategory,Long>, JpaSpecificationExecutor<ProjectCategory> {
    Optional<ProjectCategory> findByProjectCategoryId(Long projectCategoryId);

    @Query("SELECT a FROM ProjectCategory a WHERE a.isVisible = true")
    Page<ProjectCategory> findAllByVisibleTrue(Pageable pageable, Specification<ProjectCategory> spec);
}
