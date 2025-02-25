package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.AccountResponseDto;
import com.fptgang.backend.api.model.ProjectDto;
import com.fptgang.backend.model.Message;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.ProjectCategoryRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.repository.ProposalRepos;
import com.fptgang.backend.util.DateTimeUtil;
import com.fptgang.backend.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Comparator;
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
    @Autowired
    private MilestoneMapper milestoneMapper;
    @Autowired
    private MessageMapper messageMapper;
    @Autowired
    private FileMapper fileMapper;

    public ProjectDto toDTO(Project project) {
        if (project == null) {
            return null;
        }

        ProjectDto dto = new ProjectDto();
        AccountResponseDto clientDto = new AccountResponseDto();
        clientDto.setAccountId(project.getClient().getAccountId());
        clientDto.setFirstName(project.getClient().getFirstName());
        clientDto.setLastName(project.getClient().getLastName());
        clientDto.setEmail(project.getClient().getEmail());
        clientDto.setIsVerified(project.getClient().isVerified());
        clientDto.setAvatarUrl(project.getClient().getAvatarUrl());
        clientDto.setCreatedAt(DateTimeUtil.fromLocalToOffset(project.getClient().getCreatedAt()));
        dto.setProjectId(project.getProjectId());
        dto.setProjectCategoryId(project.getCategory().getProjectCategoryId());
        dto.setClient(clientDto);
        dto.setTitle(project.getTitle());
        dto.setDescription(project.getDescription());
        dto.setStatus(ProjectDto.StatusEnum.fromValue(project.getStatus().name()));
        dto.setActiveProposalId(project.getActiveProposal() != null ? project.getActiveProposal().getProposalId() : null);
        dto.setIsVisible(project.isVisible());
        dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(project.getCreatedAt()));
        dto.setUpdatedAt(DateTimeUtil.fromLocalToOffset(project.getUpdatedAt()));
        dto.setRequiredSkills(project.getRequiredSkills().stream().map(projectSkillMapper::toDTO).collect(Collectors.toList()));
        dto.setEstimateBudget(project.getMilestones().stream().map(milestone -> milestone.getBudget()).reduce(BigDecimal.ZERO, BigDecimal::add));
        dto.setProposalCount(project.getProposals().size());
        dto.setMilestones(project.getMilestones().stream().map(milestoneMapper::toDTO).collect(Collectors.toList()));
        dto.setFiles(project.getFiles().stream().map(fileMapper::toDTO).collect(Collectors.toList()));
        if(SecurityUtil.getCurrentUserId()==project.getClient().getAccountId()
                ||(project.getActiveProposal()!=null&&SecurityUtil.getCurrentUserId()==project.getActiveProposal().getFreelancer().getAccountId())
                ||(project.getStaff()!=null&&project.getStaff().getAccountId()==SecurityUtil.getCurrentUserId())){
            dto.setLatestMessage(messageMapper.toDTO(project.getMessages().stream().max(Comparator.comparing(Message::getCreatedAt)).orElse(null)));
        }
        return dto;
    }

    public Project toEntity(ProjectDto dto) {
        if (dto == null) {
            return null;
        }

        Optional<Project> existingEntityOptional = projectRepos.findByProjectId(dto.getProjectId() == null ? 0 : dto.getProjectId());

        if (existingEntityOptional.isPresent() && dto.getProjectId() != null) {
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
            existEntity.setMilestones(dto.getMilestones() != null ? dto.getMilestones().stream().map(milestoneMapper::toEntity)
                    .collect(Collectors.toList()) : existEntity.getMilestones());
            existEntity.setFiles(dto.getFiles() != null ? dto.getFiles().stream().map(fileMapper::toEntity)
                    .collect(Collectors.toList()) : existEntity.getFiles());
            return existEntity;

        } else {
            Project project = new Project();
//            project.setProjectId(dto.getProjectId());
            if(dto.getClient()!=null){
                project.setProjectId(dto.getProjectId());
            }

            if (dto.getProjectCategoryId() != null) {
                project.setCategory(projectCategoryRepos.findByProjectCategoryId(dto.getProjectCategoryId())
                        .orElseThrow(() -> new IllegalArgumentException("Project category not found")));
            }

            if (dto.getClient() != null) {
                project.setClient(accountRepos.findByAccountId(dto.getClient().getAccountId())
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

            if (dto.getMilestones() != null) {
                project.setMilestones(dto.getMilestones().stream()
                        .map(milestoneMapper::toEntity)
                        .collect(Collectors.toList()));
            }

            if (dto.getIsVisible() != null) {
                project.setVisible(dto.getIsVisible());
            }

            if (dto.getFiles() != null) {
                project.setFiles(dto.getFiles().stream()
                        .map(fileMapper::toEntity)
                        .collect(Collectors.toList()));
            }

            return project;
        }
    }

}
