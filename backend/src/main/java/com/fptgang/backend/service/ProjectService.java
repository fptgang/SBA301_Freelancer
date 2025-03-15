package com.fptgang.backend.service;

import com.fptgang.backend.model.Project;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.ProjectTimeline;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Map;

public interface ProjectService {

    Project create(Project project);
    Project update(Project project);

    Project terminateByClient(Long projectId);
    Project terminateByStaff(Long projectId, Role tranferToRole);
    Project unpause(Long projectId, ProjectTimeline timeline);
    Project extendDeadline(Long projectId, ProjectTimeline timeline);

    Project findByProjectId(long projectId);
    void deleteById(long projectId);

    Page<Project> getProjectsSortedByLatestMessage(Pageable pageable,Boolean includeInvisible,Long participantId);
    Page<Project> getAll(ListParams params);

    Project joinProject(Long projectId, Long currentUserId);

    Project leaveProject(Long projectId, Long currentUserId);
}
