package com.fptgang.backend.service;

import com.fptgang.backend.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProjectService {

    Project create(Project project);
    Project update(Project account);
    Project findByProjectId(long projectId);
    void deleteById(long projectId);
    Page<Project> getAll(Pageable pageable, String filter, String search, boolean includeInvisible, Long participantId);
    default Page<Project> getAll(Pageable pageable, String filter, String search, boolean includeInvisible) {
        return getAll(pageable, filter, search, false, null);
    }
    default Page<Project> getAll(Pageable pageable, String filter, String search) {
        return getAll(pageable, filter, search, false);
    }
    default Page<Project> getAll(Pageable pageable, String filter) {
        return getAll(pageable, filter, null, false);
    }
}
