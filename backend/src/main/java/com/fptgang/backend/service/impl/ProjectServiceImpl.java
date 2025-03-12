package com.fptgang.backend.service.impl;

import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.model.Proposal;
import com.fptgang.backend.model.Report;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.service.AccountService;
import com.fptgang.backend.service.ProjectService;
import com.fptgang.backend.service.ProposalService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.EntityUtil;
import com.fptgang.backend.util.OpenApiHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepos projectRepos;
    private final ProposalService proposalService;
    private final AccountService accountService;

    @Autowired
    public ProjectServiceImpl(ProjectRepos projectRepos, ProposalService proposalService, AccountService accountService) {
        this.projectRepos = projectRepos;
        this.proposalService = proposalService;
        this.accountService = accountService;
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
            LocalDateTime lastDeadline = LocalDateTime.now();
            BigDecimal totalBudgetRatio = BigDecimal.ZERO;
            for (var milestone : milestones) {
                milestone.setProject(finalProject);
                if (milestone.getDeadline() != null && milestone.getDeadline().isAfter(lastDeadline)) {
                    lastDeadline = milestone.getDeadline();
                    totalBudgetRatio = totalBudgetRatio.add(milestone.getBudgetRatio());
                } else
                    throw new InvalidInputException("Milestone deadline must be after the previous milestone");
            }
            if (totalBudgetRatio.compareTo(BigDecimal.ONE) != 0) {
                throw new InvalidInputException("Total budget ratio must be 1");
            }
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
        if (project.getProjectId() == null) {
            throw new InvalidInputException("Project does not exist");
        }

        Project existing = projectRepos.findByProjectId(project.getProjectId()).orElseThrow(
                () -> new InvalidInputException("Project does not exist"));
        EntityUtil.merge(existing, project);
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
        project.setIsVisible(false);
        projectRepos.save(project);
    }

    @Override
    public Page<Project> getAll(ListParams params) {
        var spec = OpenApiHelper.groupBy(params.<Project>toSpec(), "projectId");
        return projectRepos.findAll(spec, params.getPageable());
    }

    @Override
    public Page<Project> getProjectsSortedByLatestMessage(Pageable pageable, Boolean includeInvisible, Long participantId) {
        if (participantId == null) {
            throw new InvalidInputException("You are not logged in");
        }
        return projectRepos.findAllSortedByLatestMessage(pageable, includeInvisible, participantId);
    }

    @Override
    public void acceptProjectProposal(long projectId, long proposalId) {
//        Project project = projectRepos.findByProjectId(projectId).orElseThrow(
//                 () -> new InvalidInputException("Project with project id " + projectId + "not found"));
//        if(project.getActiveProposal() != null) {
//            throw new InvalidInputException("Project already has an active proposal");
//        }
//        Proposal proposal = proposalService.findById(proposalId);
//        if(proposal.getProject().getProjectId() != projectId) {
//            throw new InvalidInputException("Proposal does not belong to this project");
//        }
//        proposal.setStatus(Proposal.ProposalStatus.ACCEPTED);
//        proposal=proposalService.update(proposal);
//        project.setActiveProposal(proposal);
//        for(Proposal p : project.getProposals()) {
//            if(p.getProposalId() != proposalId) {
//                p.setStatus(Proposal.ProposalStatus.REJECTED);
//                proposalService.update(proposal);
//            }
//        }
//        projectRepos.save(project);
    }

    @Override
    public void rejectProjectProposal(long projectId, long proposalId) {
        Project project = projectRepos.findByProjectId(projectId).orElseThrow(
                () -> new InvalidInputException("Project with project id " + projectId + "not found"));
        Proposal proposal = proposalService.findById(proposalId);
        if (proposal.getProject().getProjectId() != projectId) {
            throw new InvalidInputException("Proposal does not belong to this project");
        }
        proposal.setStatus(Proposal.ProposalStatus.REJECTED);
        proposalService.update(proposal);
    }

    @Override
    public void joinProject(Long projectId, Long currentUserId) {
        Project project = projectRepos.findByProjectId(projectId).orElseThrow(
                () -> new InvalidInputException("Project with project id " + projectId + "not found"));
        if(project.getStaff()!=null&& !Objects.equals(project.getStaff().getAccountId(), currentUserId)){
            throw new InvalidInputException("Project already has a staff");
        }
        project.setStaff(
                accountService.findById(currentUserId)
        );
        project.getReports().forEach(report -> {
            if(report.getStatus() == Report.ReportStatus.UNSOLVED){
            report.setStatus(Report.ReportStatus.SOLVING);}
        });
        projectRepos.save(project);
    }

    @Override
    public void leaveProject(Long projectId, Long currentUserId) {
        Project project = projectRepos.findByProjectId(projectId).orElseThrow(
                () -> new InvalidInputException("Project with project id " + projectId + "not found"));
        if (project.getStaff() == null) {
            throw new InvalidInputException("Project does not have a staff");
        } else if (!Objects.equals(project.getStaff().getAccountId(), currentUserId)) {
            throw new InvalidInputException("You are not a staff of this project");
        }
        project.getReports().forEach(report -> {
            if(report.getStatus() == Report.ReportStatus.UNSOLVED){
                report.setStatus(Report.ReportStatus.SOLVING);}
        });
        project.setStaff(null);
        projectRepos.save(project);
    }
}
