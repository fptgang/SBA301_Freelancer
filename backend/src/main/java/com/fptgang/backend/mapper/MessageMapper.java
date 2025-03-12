package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.MessageDto;
import com.fptgang.backend.model.Message;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.MessageRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.util.DateTimeUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class MessageMapper extends BaseMapper<MessageDto, Message> {
    private final MessageRepos messageRepos;
    private final AccountRepos accountRepos;
    private final ProjectRepos projectRepos;
    private final FileMapper fileMapper;
    private final AccountMapper accountMapper;

    public MessageMapper(MessageRepos messageRepos, AccountRepos accountRepos, ProjectRepos projectRepos, FileMapper fileMapper, AccountMapper accountMapper) {
        this.messageRepos = messageRepos;
        this.accountRepos = accountRepos;
        this.projectRepos = projectRepos;
        this.fileMapper = fileMapper;
        this.accountMapper = accountMapper;
    }

    @Override
    public Message toEntity(MessageDto dto) {
        if (dto == null) {
            return null;
        }

        Message entity = new Message();
        entity.setMessageId(dto.getMessageId());

        if (dto.getContent() != null) {
            entity.setContent(dto.getContent());
        }

        if (dto.getProjectId() != null) {
            entity.setProject(projectRepos.findByProjectId(dto.getProjectId())
                    .orElseThrow(() -> new IllegalArgumentException("Project not found")));
        }

        if (dto.getSender() != null) {
            entity.setSender(accountRepos.findByAccountId(dto.getSender().getAccountId())
                    .orElseThrow(() -> new IllegalArgumentException("Sender not found")));
        }

        if (dto.getIsVisible() != null) {
            entity.setIsVisible(dto.getIsVisible());
        }

        if (dto.getFiles() != null) {
            entity.setFiles(dto.getFiles().stream().map(fileMapper::toEntity).toList());
        }

        entity.setCreatedAt(DateTimeUtil.fromOffsetToLocal(dto.getCreatedAt()));

        return entity;
    }

    @Override
    public MessageDto toDTO(Message entity, DetailLevel level) {
        if (entity == null) {
            return null;
        }

        MessageDto dto = new MessageDto();
        dto.setMessageId(entity.getMessageId());
        dto.setProjectId(entity.getProject().getProjectId());
        dto.setSender(accountMapper.toResponseDto(accountMapper.toDTO(entity.getSender(), DetailLevel.REFERENCE)));
        dto.setContent(entity.getContent());
        dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));
        dto.setIsVisible(entity.getIsVisible());

        if (level == DetailLevel.REFERENCE) {
            return dto; // those fields are enough
        }

        if (level == DetailLevel.SUMMARY) {
            return dto; // those fields are enough
        }

        dto.setFiles(entity.getFiles().stream().map(f -> fileMapper.toDTO(f, DetailLevel.REFERENCE)).toList());

        // Add more fields if needed for other detail levels

        return dto;
    }
}