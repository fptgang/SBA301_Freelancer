package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProjectDto;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.ProjectCategoryRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.repository.ProposalRepos;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class ProjectMapper extends BaseMapper<ProjectDto, Project> {

    @Autowired
    private ProjectRepos projectRepos;

    @Autowired
    private ProjectCategoryRepos projectCategoryRepos;

    @Autowired
    private ProposalRepos proposalRepos;

    @Autowired
    private AccountRepos accountRepos;

    @Autowired
    private ProjectSkillMapper projectSkillMapper;

    public ProjectDto toDTO(Project project) {
        if (project == null) {
            return null;
        }

        ProjectDto dto = new ProjectDto();
        dto.setProjectId(project.getProjectId());
        dto.setProjectCategoryId(project.getCategory().getProjectCategoryId());
        dto.setClientId(project.getClient().getAccountId());
        dto.setTitle(project.getTitle());
        dto.setDescription(project.getDescription());
        dto.setStatus(ProjectDto.StatusEnum.fromValue(project.getStatus().name()));
        dto.setActiveProposalId(project.getActiveProposal() != null ? project.getActiveProposal().getProposalId() : null);
        dto.setIsVisible(project.isVisible());
        dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(project.getCreatedAt()));
        dto.setUpdatedAt(DateTimeUtil.fromLocalToOffset(project.getUpdatedAt()));
        dto.setRequiredSkills(project.getRequiredSkills().stream().map(projectSkillMapper::toDTO).collect(Collectors.toList()));

        return dto;
    }

    public Project toEntity(ProjectDto dto) {
        if (dto == null) {
            return null;
        }

        Optional<Project> existingEntityOptional = projectRepos.findByProjectId(dto.getProjectId());

        if (existingEntityOptional.isPresent()) {
            Project existEntity = existingEntityOptional.get();

            existEntity.setTitle(dto.getTitle() != null ? dto.getTitle() : existEntity.getTitle());
            existEntity.setDescription(dto.getDescription() != null ? dto.getDescription() : existEntity.getDescription());
            existEntity.setStatus(dto.getStatus() != null ? Project.ProjectStatus.valueOf(dto.getStatus().getValue()) : existEntity.getStatus());
            existEntity.setVisible(dto.getIsVisible() != null ? dto.getIsVisible() : existEntity.isVisible());
            existEntity.setCategory(dto.getProjectCategoryId() != null ?
                    projectCategoryRepos.findByProjectCategoryId(dto.getProjectCategoryId())
                            .orElseThrow(() -> new IllegalArgumentException("Project category not found")) :
                    existEntity.getCategory());
            existEntity.setActiveProposal(dto.getActiveProposalId() != null ?
                    proposalRepos.findByProposalId(dto.getActiveProposalId())
                        .orElseThrow(() -> new IllegalArgumentException("Proposal not found")) :
                    existEntity.getActiveProposal());
            existEntity.setRequiredSkills(dto.getRequiredSkills() != null ?
                    dto.getRequiredSkills().stream().map(projectSkillMapper::toEntity).collect(Collectors.toList()) :
                    existEntity.getRequiredSkills());

            return existEntity;

        } else {
            Project project = new Project();
            project.setProjectId(dto.getProjectId());

            if (dto.getProjectCategoryId() != null) {
                project.setCategory(projectCategoryRepos.findByProjectCategoryId(dto.getProjectCategoryId())
                        .orElseThrow(() -> new IllegalArgumentException("Project category not found")));
            }

            if (dto.getClientId() != null) {
                project.setClient(accountRepos.findByAccountId(dto.getClientId())
                        .orElseThrow(() -> new IllegalArgumentException("Client not found")));
            }

            project.setTitle(dto.getTitle());
            project.setDescription(dto.getDescription());

            if (dto.getStatus() != null) {
                project.setStatus(Project.ProjectStatus.valueOf(dto.getStatus().getValue()));
            }

            if (dto.getActiveProposalId() != null) {
                project.setActiveProposal(proposalRepos.findByProposalId(dto.getActiveProposalId())
                        .orElseThrow(() -> new IllegalArgumentException("Proposal not found")));
            }

            if (dto.getRequiredSkills() != null) {
                project.setRequiredSkills(dto.getRequiredSkills().stream()
                        .map(projectSkillMapper::toEntity)
                        .collect(Collectors.toList()));
            }

            if (dto.getIsVisible() != null) {
                project.setVisible(dto.getIsVisible());
            }

            return project;
        }
    }

}
