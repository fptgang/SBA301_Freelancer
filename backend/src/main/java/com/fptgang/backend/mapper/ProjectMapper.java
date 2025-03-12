package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProjectDto;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.ProjectCategoryRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.util.DateTimeUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Component
public class ProjectMapper extends BaseMapper<ProjectDto, Project> {
    private final ProjectRepos projectRepos;
    private final ProjectCategoryRepos projectCategoryRepos;
    private final AccountRepos accountRepos;
    private final ProjectSkillMapper projectSkillMapper;
    private final MilestoneMapper milestoneMapper;
    private final MessageMapper messageMapper;
    private final FileMapper fileMapper;
    private final AccountMapper accountMapper;
    private final ReportMapper reportMapper;

    public ProjectMapper(ProjectRepos projectRepos, ProjectCategoryRepos projectCategoryRepos, AccountRepos accountRepos,
                         ProjectSkillMapper projectSkillMapper, MilestoneMapper milestoneMapper, MessageMapper messageMapper,
                         FileMapper fileMapper, AccountMapper accountMapper, ReportMapper reportMapper) {
        this.projectRepos = projectRepos;
        this.projectCategoryRepos = projectCategoryRepos;
        this.accountRepos = accountRepos;
        this.projectSkillMapper = projectSkillMapper;
        this.milestoneMapper = milestoneMapper;
        this.messageMapper = messageMapper;
        this.fileMapper = fileMapper;
        this.accountMapper = accountMapper;
        this.reportMapper = reportMapper;
    }

    @Override
    public Project toEntity(ProjectDto dto) {
        if (dto == null) {
            return null;
        }

        Project entity = new Project();
        entity.setProjectId(dto.getProjectId());
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setStatus(Project.ProjectStatus.valueOf(dto.getStatus().getValue()));
        entity.setIsVisible(dto.getIsVisible());
        entity.setCreatedAt(DateTimeUtil.fromOffsetToLocal(dto.getCreatedAt()));
        entity.setUpdatedAt(DateTimeUtil.fromOffsetToLocal(dto.getUpdatedAt()));
        entity.setMaxBudget(dto.getMaxBudget());
        entity.setMinBudget(dto.getMinBudget());

        if (dto.getProjectCategoryId() != null) {
            entity.setCategory(projectCategoryRepos.findByProjectCategoryId(dto.getProjectCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Project category not found")));
        }

        if (dto.getClient() != null) {
            entity.setClient(accountRepos.findByAccountId(dto.getClient().getAccountId())
                    .orElseThrow(() -> new IllegalArgumentException("Client not found")));
        }

        if (dto.getRequiredSkills() != null) {
            entity.setRequiredSkills(dto.getRequiredSkills().stream()
                    .map(projectSkillMapper::toEntity)
                    .collect(Collectors.toList()));
        }

        if (dto.getMilestones() != null) {
            entity.setMilestones(dto.getMilestones().stream()
                    .map(milestoneMapper::toEntity)
                    .collect(Collectors.toList()));
        }

        if (dto.getFiles() != null) {
            entity.setFiles(dto.getFiles().stream()
                    .map(fileMapper::toEntity)
                    .collect(Collectors.toList()));
        }

        return entity;
    }

    @Override
    public ProjectDto toDTO(Project entity, DetailLevel level) {
        if (entity == null) {
            return null;
        }

        ProjectDto dto = new ProjectDto();
        dto.setProjectId(entity.getProjectId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setStatus(ProjectDto.StatusEnum.fromValue(entity.getStatus().name()));
        dto.setIsVisible(entity.getIsVisible());
        dto.setMaxBudget(entity.getMaxBudget());
        dto.setMinBudget(entity.getMinBudget());
        dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));
        dto.setUpdatedAt(DateTimeUtil.fromLocalToOffset(entity.getUpdatedAt()));

        if (entity.getCategory() != null) {
            dto.setProjectCategoryId(entity.getCategory().getProjectCategoryId());
        }

        if (entity.getClient() != null) {
            dto.setClient(accountMapper.toResponseDto(
                    accountMapper.toDTO(entity.getClient(), DetailLevel.REFERENCE)));
        }

        if (level == DetailLevel.REFERENCE) {
            return dto; // those fields are enough
        }


        if (entity.getRequiredSkills() != null) {
            dto.setRequiredSkills(entity.getRequiredSkills().stream()
                    .map(skill -> projectSkillMapper.toDTO(skill, DetailLevel.REFERENCE))
                    .collect(Collectors.toList()));
        }

        if (entity.getMilestones() != null) {
            dto.setMilestones(entity.getMilestones().stream()
                    .map(milestone -> milestoneMapper.toDTO(milestone, DetailLevel.REFERENCE))
                    .collect(Collectors.toList()));
        }

        if (entity.getFiles() != null) {
            dto.setFiles(entity.getFiles().stream()
                    .map(file -> fileMapper.toDTO(file, DetailLevel.REFERENCE))
                    .collect(Collectors.toList()));
        }
        if (level == DetailLevel.SUMMARY) {
            return dto; // those fields are enough
        }
        if(entity.getMessages() != null) {
            dto.setLatestMessage(messageMapper.toDTO(entity.getMessages().getLast(), DetailLevel.REFERENCE));
        }
        if(entity.getReports() != null) {
            dto.setReports(entity.getReports().stream()
                    .map(report -> reportMapper.toDTO(report, DetailLevel.REFERENCE))
                    .collect(Collectors.toList()));
        }

        return dto;
    }
}