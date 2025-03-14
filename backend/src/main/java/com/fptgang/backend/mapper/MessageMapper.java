package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.MessageDto;
import com.fptgang.backend.model.Message;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.FileRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.util.DateTimeUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class MessageMapper extends BaseMapper<MessageDto, Message> {
    private final AccountRepos accountRepos;
    private final ProjectRepos projectRepos;
    private final FileMapper fileMapper;
    private final FileRepos fileRepos;
    private final AccountMapper accountMapper;

    public MessageMapper(AccountRepos accountRepos,
                         ProjectRepos projectRepos,
                         FileMapper fileMapper,
                         FileRepos fileRepos,
                         AccountMapper accountMapper) {
        this.accountRepos = accountRepos;
        this.projectRepos = projectRepos;
        this.fileMapper = fileMapper;
        this.fileRepos = fileRepos;
        this.accountMapper = accountMapper;
    }

    @Override
    public Message toEntity(MessageDto dto) {
        if (dto == null) {
            return null;
        }

        Message entity = new Message();
        entity.setMessageId(dto.getMessageId());
        if (dto.getSender() != null && dto.getSender().getAccountId() != null) {
            entity.setSender(accountRepos.getReferenceById(dto.getSender().getAccountId()));
        }
        if (dto.getProjectId() != null) {
            entity.setProject(projectRepos.getReferenceById(dto.getProjectId()));
        }
        entity.setContent(dto.getContent());
        entity.setIsVisible(dto.getIsVisible());
        entity.setFiles(dto.getFiles() == null ? null : dto.getFiles().stream()
                .filter(e -> e.getFileId() != null)
                .map(e -> fileRepos.getReferenceById(e.getFileId()))
                .toList());
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

        if (level == DetailLevel.REFERENCE) {
            return dto; // those fields are enough
        }
        dto.setContent(entity.getContent());
        dto.setFiles(entity.getFiles().stream()
                .map(f -> fileMapper.toDTO(f, DetailLevel.FULL))
                .toList());
        dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));

        if(level == DetailLevel.SUMMARY) {
            return dto;
        }

        dto.setSender(accountMapper.toDTO(entity.getSender(), DetailLevel.REFERENCE));
        dto.setProjectId(entity.getProject().getProjectId());
        dto.setIsVisible(entity.getIsVisible());


        return dto;
    }
}