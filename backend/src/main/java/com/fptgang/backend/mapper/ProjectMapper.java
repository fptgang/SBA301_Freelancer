package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProjectDto;
import com.fptgang.backend.api.model.ProjectStatusDto;
import com.fptgang.backend.api.model.ProjectTerminationReasonDto;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.repository.*;
import com.fptgang.backend.service.MessageService;
import com.fptgang.backend.service.ProposalService;
import com.fptgang.backend.util.DateTimeUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Slf4j
@Component
public class ProjectMapper extends BaseMapper<ProjectDto, Project> {
    private final ProjectCategoryRepos projectCategoryRepos;
    private final ProjectCategoryMapper projectCategoryMapper;
    private final AccountRepos accountRepos;
    private final AccountMapper accountMapper;
    private final FileRepos fileRepos;
    private final FileMapper fileMapper;
    private final ContractRepos contractRepos;
    private final ContractMapper contractMapper;
    private final MilestoneRepos milestoneRepos;
    private final MilestoneMapper milestoneMapper;
    private final ProjectSkillMapper projectSkillMapper;
    private final MessageMapper messageMapper;
    private final MessageService messageService;
    private final ProposalService proposalService;

    public ProjectMapper(ProjectCategoryRepos projectCategoryRepos,
                         ProjectCategoryMapper projectCategoryMapper,
                         AccountRepos accountRepos,
                         AccountMapper accountMapper,
                         FileRepos fileRepos,
                         FileMapper fileMapper,
                         ContractRepos contractRepos,
                         ContractMapper contractMapper,
                         MilestoneRepos milestoneRepos,
                         MilestoneMapper milestoneMapper,
                         ProjectSkillMapper projectSkillMapper,
                         MessageMapper messageMapper,
                         MessageService messageService,
                         ProposalService proposalService) {
        this.projectCategoryRepos = projectCategoryRepos;
        this.projectCategoryMapper = projectCategoryMapper;
        this.accountRepos = accountRepos;
        this.accountMapper = accountMapper;
        this.fileRepos = fileRepos;
        this.fileMapper = fileMapper;
        this.contractRepos = contractRepos;
        this.contractMapper = contractMapper;
        this.milestoneRepos = milestoneRepos;
        this.milestoneMapper = milestoneMapper;
        this.projectSkillMapper = projectSkillMapper;
        this.messageMapper = messageMapper;
        this.messageService = messageService;
        this.proposalService = proposalService;
    }

    @Override
    public Project toEntity(ProjectDto dto) {
        if (dto == null) {
            return null;
        }

        Project entity = new Project();
        entity.setProjectId(dto.getProjectId());
        if (dto.getProjectCategory() != null && dto.getProjectCategory().getProjectCategoryId() != null) {
            entity.setCategory(projectCategoryRepos.getReferenceById(dto.getProjectCategory().getProjectCategoryId()));
        }
        if (dto.getClient() != null && dto.getClient().getAccountId() != null) {
            entity.setClient(accountRepos.getReferenceById(dto.getClient().getAccountId()));
        }
        if (dto.getStaff() != null && dto.getStaff().getAccountId() != null) {
            entity.setStaff(accountRepos.getReferenceById(dto.getStaff().getAccountId()));
        }
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setStatus(dto.getStatus() == null ? null :
                Project.ProjectStatus.valueOf(dto.getStatus().getValue()));
        entity.setStartDate(DateTimeUtil.fromOffsetToLocal(dto.getStartDate()));
        entity.setMaxBudget(dto.getMaxBudget());
        entity.setMinBudget(dto.getMinBudget());
        entity.setCreatedAt(DateTimeUtil.fromOffsetToLocal(dto.getCreatedAt()));
        entity.setUpdatedAt(DateTimeUtil.fromOffsetToLocal(dto.getUpdatedAt()));
        entity.setIsVisible(dto.getIsVisible());
        entity.setFiles(dto.getFiles() == null ? null : dto.getFiles().stream()
                .filter(e -> e.getFileId() != null)
                .map(e -> fileRepos.getReferenceById(e.getFileId()))
                .toList());
        if (dto.getContract() != null && dto.getContract().getContractId() != null) {
            entity.setContract(contractRepos.getReferenceById(dto.getContract().getContractId()));
        }
        if (dto.getMilestones() != null) {
            entity.setMilestones(dto.getMilestones().stream()
                    .filter(e -> e.getMilestoneId() != null)
                    .map(e -> milestoneRepos.getReferenceById(e.getMilestoneId()))
                    .collect(Collectors.toList()));
        }
        if (dto.getRequiredSkills() != null) {
            entity.setRequiredSkills(dto.getRequiredSkills().stream()
                    .map(projectSkillMapper::toEntity)
                    .collect(Collectors.toList()));
        }
        entity.setTerminationReason(dto.getTerminationReason() == null ? null :
                Project.TerminationReason.valueOf(dto.getTerminationReason().name()));
        entity.setToTerminate(dto.getToTerminate());
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
        dto.setIsVisible(entity.getIsVisible());
        dto.setDescription(entity.getDescription());

        if (level == DetailLevel.REFERENCE) {
            dto.setProjectCategory(projectCategoryMapper.toDTO(entity.getCategory(), DetailLevel.REFERENCE));
            return dto; // Those fields are enough
        }
        dto.setProposalCount(proposalService.countByProjectIdAndStatus(entity.getProjectId(), null));
        dto.setProjectCategory(projectCategoryMapper.toDTO(entity.getCategory(), DetailLevel.FULL));
        dto.setClient(accountMapper.toDTO(entity.getClient(), DetailLevel.REFERENCE));
        dto.setStatus(ProjectStatusDto.valueOf(entity.getStatus().name()));
        dto.setStartDate(DateTimeUtil.fromLocalToOffset(entity.getStartDate()));
        dto.setMaxBudget(entity.getMaxBudget());
        dto.setMinBudget(entity.getMinBudget());
        dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));
        dto.setUpdatedAt(DateTimeUtil.fromLocalToOffset(entity.getUpdatedAt()));
        dto.setTerminationReason(entity.getTerminationReason() == null ? null :
                ProjectTerminationReasonDto.valueOf(entity.getTerminationReason().name()));
        dto.setToTerminate(entity.getToTerminate());
        dto.setMilestones(entity.getMilestones().stream()
                .map(milestone -> milestoneMapper.toDTO(milestone, DetailLevel.FULL))
                .collect(Collectors.toList()));
        dto.setRequiredSkills(entity.getRequiredSkills().stream()
                .map(skill -> projectSkillMapper.toDTO(skill, DetailLevel.FULL))
                .collect(Collectors.toList()));
        dto.setRequiredSkills(entity.getRequiredSkills().stream()
                .map((s) -> projectSkillMapper.toDTO(s, DetailLevel.FULL))
                .collect(Collectors.toList()));
        if (level == DetailLevel.SUMMARY) {
            return dto; // Those fields are enough
        }
        dto.setStaff(entity.getStaff()!=null && entity.getStaff().getAccountId()!=0?accountMapper.toDTO(entity.getStaff(), DetailLevel.REFERENCE):null);
        dto.setFiles(entity.getFiles().stream()
                .map(f -> fileMapper.toDTO(f, DetailLevel.FULL))
                .toList());
        dto.setContract(entity.getContract()!=null?contractMapper.toDTO(entity.getContract(), DetailLevel.FULL):null);

        dto.setLatestMessage(messageMapper.toDTO(
                messageService.findLatestVisibleMessageByProject(entity.getProjectId()),
                DetailLevel.REFERENCE
        ));
        return dto;
    }
}