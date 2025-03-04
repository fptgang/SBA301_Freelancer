package com.fptgang.backend.service.impl;

import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.model.Proposal;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.service.ProjectService;
import com.fptgang.backend.service.ProposalService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.OpenApiHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Service;

@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepos projectRepos;
    private final ProposalService proposalService;

    @Autowired
    public ProjectServiceImpl(ProjectRepos projectRepos, ProposalService proposalService) {
        this.projectRepos = projectRepos;
        this.proposalService = proposalService;
    }


    @Override
    public Project create(Project project) {
        // First save the project without milestones
        var milestones = project.getMilestones();
        var skills = project.getRequiredSkills();
        project.setRequiredSkills(null);
        project.setMilestones(null);
        project = projectRepos.save(project);
        // Then set and save milestones if present
        if (milestones != null && !milestones.isEmpty()
                && skills != null && !skills.isEmpty()
        ) {
            Project finalProject = project;
            milestones.forEach(milestone -> {
                milestone.setProject(finalProject);
            });
            skills.forEach(skill -> {
                skill.setProject(finalProject);
            });
            project.setRequiredSkills(skills);
            project.setMilestones(milestones);
            project = projectRepos.save(project);
        }

        return project;
    }

    @Override
    public Project update(Project project) {
        if (project.getProjectId() == null || projectRepos.existsById(project.getProjectId())) {
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
    public Page<Project> getAll(ListParams params) {
        var spec = OpenApiHelper.groupBy( params.<Project>toSpec(), "projectId");
        return projectRepos.findAll(spec, params.getPageable());
    }

    @Override
    public Page<Project> getProjectsSortedByLatestMessage(Pageable pageable, Boolean includeInvisible, Long participantId) {
        if(participantId == null) {
            throw new InvalidInputException("You are not logged in");
        }
        return projectRepos.findAllSortedByLatestMessage(pageable,includeInvisible,participantId);
    }

    @Override
    public void acceptProjectProposal(long projectId, long proposalId) {
        Project project = projectRepos.findByProjectId(projectId).orElseThrow(
                 () -> new InvalidInputException("Project with project id " + projectId + "not found"));
        if(project.getActiveProposal() != null) {
            throw new InvalidInputException("Project already has an active proposal");
        }
        Proposal proposal = proposalService.findById(proposalId);
        if(proposal.getProject().getProjectId() != projectId) {
            throw new InvalidInputException("Proposal does not belong to this project");
        }
        proposal.setStatus(Proposal.ProposalStatus.ACCEPTED);
        proposal=proposalService.update(proposal);
        project.setActiveProposal(proposal);
        for(Proposal p : project.getProposals()) {
            if(p.getProposalId() != proposalId) {
                p.setStatus(Proposal.ProposalStatus.REJECTED);
                proposalService.update(proposal);
            }
        }
        projectRepos.save(project);
    }

    @Override
    public void rejectProjectProposal(long projectId, long proposalId) {
        Project project = projectRepos.findByProjectId(projectId).orElseThrow(
                () -> new InvalidInputException("Project with project id " + projectId + "not found"));
        Proposal proposal = proposalService.findById(proposalId);
        if(proposal.getProject().getProjectId() != projectId) {
            throw new InvalidInputException("Proposal does not belong to this project");
        }
        proposal.setStatus(Proposal.ProposalStatus.REJECTED);
        proposalService.update(proposal);
    }
}
