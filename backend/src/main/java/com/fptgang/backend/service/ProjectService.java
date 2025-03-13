package com.fptgang.backend.service;

import com.fptgang.backend.model.Project;
import com.fptgang.backend.service.params.ListParams;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProjectService {

    Project create(Project project);
    Project update(Project account);
    Project findByProjectId(long projectId);
    void deleteById(long projectId);

    Page<Project> getProjectsSortedByLatestMessage(Pageable pageable,Boolean includeInvisible,Long participantId);
    Page<Project> getAll(ListParams params);

    Project joinProject(Long projectId, Long currentUserId);

    Project leaveProject(Long projectId, Long currentUserId);
}
