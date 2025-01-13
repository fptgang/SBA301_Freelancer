package com.fptgang.backend.repository;

import com.fptgang.backend.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProjectRepos extends JpaRepository<Project,Long> {
    Optional<Project> findByProjectId(Long projectId);
}
