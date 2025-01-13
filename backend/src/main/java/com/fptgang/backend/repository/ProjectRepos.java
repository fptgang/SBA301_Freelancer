package com.fptgang.backend.repository;

import com.fptgang.backend.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface ProjectRepos extends JpaRepository<Project,Long> {
    Optional<Project> findByProjectId(Long projectId);
}
