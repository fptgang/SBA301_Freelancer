package com.fptgang.backend.repository;

import com.fptgang.backend.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface ProjectRepos extends JpaRepository<Project,Long>, JpaSpecificationExecutor<Project> {
    Optional<Project> findByProjectId(Long projectId);
}
