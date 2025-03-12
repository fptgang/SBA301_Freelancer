package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.FileDto;
import com.fptgang.backend.model.File;
import com.fptgang.backend.repository.*;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.stereotype.Component;

@Component
public class FileMapper extends BaseMapper<FileDto, File> {
    private final AccountMapper accountMapper;
    private final AccountRepos accountRepos;
    private final ProposalRepos proposalRepos;
    private final MessageRepos messageRepos;
    private final ProjectRepos projectRepos;
    private final MilestoneRepos milestoneRepos;

    public FileMapper(AccountMapper accountMapper,
                      AccountRepos accountRepos,
                      ProposalRepos proposalRepos,
                      MessageRepos messageRepos,
                      ProjectRepos projectRepos,
                      MilestoneRepos milestoneRepos) {
        this.accountMapper = accountMapper;
        this.accountRepos = accountRepos;
        this.proposalRepos = proposalRepos;
        this.messageRepos = messageRepos;
        this.projectRepos = projectRepos;
        this.milestoneRepos = milestoneRepos;
    }

    @Override
    public File toEntity(FileDto dto) {
        if (dto == null) {
            return null;
        }

        File entity = new File();
        entity.setFileId(dto.getFileId());
        if (dto.getUploader() != null && dto.getUploader().getAccountId() != null) {
            entity.setUploader(accountRepos.getReferenceById(dto.getUploader().getAccountId()));
        }
        entity.setFileName(dto.getFileName());
        entity.setFileUrl(dto.getFileUrl());
        entity.setFileType(dto.getFileType());
        entity.setSize(dto.getSize());
        entity.setIsVisible(dto.getIsVisible());
        entity.setCreatedAt(DateTimeUtil.fromOffsetToLocal(dto.getCreatedAt()));
        if (dto.getMessageId() != null) {
            entity.setMessage(messageRepos.getReferenceById(dto.getMessageId()));
        }
        if (dto.getProposalId() != null) {
            entity.setProposal(proposalRepos.getReferenceById(dto.getProposalId()));
        }
        if (dto.getProjectId() != null) {
            entity.setProject(projectRepos.getReferenceById(dto.getProjectId()));
        }
        if (dto.getMilestoneId() != null) {
            entity.setMilestone(milestoneRepos.getReferenceById(dto.getMilestoneId()));
        }

        return entity;
    }

    @Override
    public FileDto toDTO(File entity, DetailLevel detailLevel) {
        if (entity == null) {
            return null;
        }

        FileDto dto = new FileDto();
        dto.setFileId(entity.getFileId());
        dto.setUploader(accountMapper.toDTO(entity.getUploader(), DetailLevel.REFERENCE));
        dto.setFileName(entity.getFileName());
        dto.setFileUrl(entity.getFileUrl());
        dto.setFileType(entity.getFileType());
        dto.setSize(entity.getSize());
        dto.setIsVisible(entity.getIsVisible());
        dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));
        dto.setMessageId(entity.getMessage() != null ? entity.getMessage().getMessageId() : null);
        dto.setProposalId(entity.getProposal() != null ? entity.getProposal().getProposalId() : null);
        dto.setProjectId(entity.getProject() != null ? entity.getProject().getProjectId() : null);
        dto.setProposalId(entity.getMilestone() != null ? entity.getMilestone().getMilestoneId() : null);

        return dto;
    }
}
