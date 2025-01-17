package com.fptgang.backend.service.impl;

import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.service.ProjectService;
import com.fptgang.backend.util.OpenApiHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepos projectRepos;

    @Autowired
    public ProjectServiceImpl(ProjectRepos projectRepos) {
        this.projectRepos = projectRepos;
    }


    @Override
    public Project create(Project project) {
        return projectRepos.save(project);
    }

    @Override
    public Project update(Project project) {
        if(project.getProjectId() == null || projectRepos.existsById(project.getProjectId())){
            throw new InvalidInputException("Prject does not exist");
        }
        return projectRepos.save(project);
    }

    @Override
    public Project findByProjectId(long projectId) {
        Project project = projectRepos.findByProjectId(projectId).orElseThrow(() -> new InvalidInputException("Project with project id " + projectId + "not found"));
        return project;
    }

    @Override
    public void deleteById(long projectId) {
        Project project = projectRepos.findByProjectId(projectId).orElseThrow(() -> new InvalidInputException("Project with project id " + projectId + "not found"));
        project.setVisible(false);
        projectRepos.save(project);
    }

    @Override
    public Page<Project> getAll(Pageable pageable, String filter) {
        var spec = OpenApiHelper.<Project>toSpecification(filter);
        return projectRepos.findAll(spec, pageable);
    }
}
