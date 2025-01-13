package com.fptgang.backend.service;

import com.fptgang.backend.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProjectService {

    Project create(Project project);
    void update(Project account);
    Project findByProjectId(long projectId);
    void deleteById(long projectId);
    Page<Project> getAll(Pageable pageable, String filter);
}
