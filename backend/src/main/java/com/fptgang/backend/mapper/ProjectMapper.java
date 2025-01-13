package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProjectDto;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.model.ProjectCategory;
import com.fptgang.backend.model.Proposal;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.model.Milestone;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

@Component
public class ProjectMapper extends BaseMapper<ProjectDto, Project> {

    @Autowired
    private ProjectRepos projectRepos;


    ProjectDto toDTO(Project project) {
        if (project == null) {
            return null;
        }

        ProjectDto dto = new ProjectDto();
        dto.setProjectId(project.getProjectId());
        dto.setProjectCategoryId(project.getCategory().getProjectCategoryId());
        dto.setClientId(project.getClient() != null ? project.getClient().getAccountId() : null);
        dto.setTitle(project.getTitle());
        dto.setDescription(project.getDescription());
        dto.setMinEstimatedBudget(project.getMinEstimatedBudget());
        dto.setMaxEstimatedBudget(project.getMaxEstimatedBudget());
        dto.setEstimatedDeadline(project.getEstimatedDeadline() != null ? OffsetDateTime.of(project.getEstimatedDeadline(), ZoneOffset.UTC) : null);
        dto.setStatus(ProjectDto.StatusEnum.fromValue(project.getStatus().name()));
        dto.setActiveProposalId(project.getActiveProposal() != null ? project.getActiveProposal().getProposalId() : null);
        dto.setIsVisible(project.isVisible());
        dto.setCreatedAt(project.getCreatedAt() != null ? OffsetDateTime.of(project.getCreatedAt(), ZoneOffset.UTC) : null);
        dto.setUpdatedAt(project.getUpdatedAt() != null ? OffsetDateTime.of(project.getUpdatedAt(), ZoneOffset.UTC) : null);

        return dto;
    }

    Project toEntity(ProjectDto dto) {
        if (dto == null) {
            return null;
        }

        Optional<Project> existingEntityOptional = projectRepos.findByProjectId(dto.getProjectId());
        if (existingEntityOptional.isPresent()) {
            Project existEntity = existingEntityOptional.get();

            existEntity.setTitle(dto.getTitle() != null ? dto.getTitle() : existEntity.getTitle());
            existEntity.setDescription(dto.getDescription() != null ? dto.getDescription() : existEntity.getDescription());
            existEntity.setUpdatedAt(LocalDateTime.from(Instant.now()));
            existEntity.setStatus(dto.getStatus() != null ? Project.ProjectStatus.valueOf(dto.getStatus().getValue()) : existEntity.getStatus());
            existEntity.setEstimatedDeadline(dto.getEstimatedDeadline() != null ? dto.getEstimatedDeadline().toLocalDateTime() : existEntity.getEstimatedDeadline());
            existEntity.setMaxEstimatedBudget(dto.getMaxEstimatedBudget() != null ? dto.getMaxEstimatedBudget() : existEntity.getMaxEstimatedBudget());
            existEntity.setMinEstimatedBudget(dto.getMinEstimatedBudget() != null ? dto.getMinEstimatedBudget() : existEntity.getMinEstimatedBudget());
            existEntity.setVisible(dto.getIsVisible() != null ? dto.getIsVisible() : true);


            return existEntity;

        } else {
            Project project = new Project();
            project.setProjectId(dto.getProjectId());

            if (dto.getProjectCategoryId() != null) {
                ProjectCategory category = new ProjectCategory();
                category.setProjectCategoryId(dto.getProjectCategoryId());
                project.setCategory(category);
            } else {
                project.setCategory(null);
            }

            if (dto.getClientId() != null) {
                Account client = new Account();
                client.setAccountId(dto.getClientId());
                project.setClient(client);
            } else {
                project.setClient(null);
            }

            project.setTitle(dto.getTitle());
            project.setDescription(dto.getDescription());
            project.setMinEstimatedBudget(dto.getMinEstimatedBudget());
            project.setMaxEstimatedBudget(dto.getMaxEstimatedBudget());

            if (dto.getEstimatedDeadline() != null) {
                project.setEstimatedDeadline(dto.getEstimatedDeadline().toLocalDateTime());
            } else {
                project.setEstimatedDeadline(null);
            }

            if (dto.getStatus() != null) {
                project.setStatus(Project.ProjectStatus.valueOf(dto.getStatus().getValue()));
            } else {
                project.setStatus(null);
            }

            if (dto.getActiveProposalId() != null) {
                Proposal activeProposal = new Proposal();
                activeProposal.setProposalId(dto.getActiveProposalId());
                project.setActiveProposal(activeProposal);
            } else {
                project.setActiveProposal(null);
            }

            if (dto.getIsVisible() != null) {
                project.setVisible(dto.getIsVisible());
            } else {
                project.setVisible(true);
            }

            if (dto.getCreatedAt() != null) {
                project.setCreatedAt(dto.getCreatedAt().toLocalDateTime());
            } else {
                project.setCreatedAt(null);
            }

            if (dto.getUpdatedAt() != null) {
                project.setUpdatedAt(dto.getUpdatedAt().toLocalDateTime());
            } else {
                project.setUpdatedAt(null);
            }

            return project;
        }
    }

}
