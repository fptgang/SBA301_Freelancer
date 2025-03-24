package com.fptgang.backend.repository;


import com.fptgang.backend.model.ProjectCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface ProjectCategoryRepos extends JpaRepository<ProjectCategory,Long>, JpaSpecificationExecutor<ProjectCategory> {
    Optional<ProjectCategory> findByProjectCategoryId(Long projectCategoryId);
    @Query("SELECT pc FROM ProjectCategory pc " +
            "LEFT JOIN Project  p ON pc.projectCategoryId=p.category.projectCategoryId " +
            "GROUP BY pc.projectCategoryId " +
            "ORDER BY COUNT(p) DESC " +
            "LIMIT 8")
    List<ProjectCategory> findTop8Categories();
}
