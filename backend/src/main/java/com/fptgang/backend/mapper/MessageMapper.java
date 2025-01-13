package com.fptgang.backend.mapper;


import com.fptgang.backend.api.model.MessageDto;
import com.fptgang.backend.repository.MessageRepos;
import com.fptgang.model.File;
import com.fptgang.model.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class MessageMapper extends BaseMapper<MessageDto, Message> {

    @Autowired
    private MessageRepos messageRepos;

    @Override
    public MessageDto toDTO(Message entity) {
        if (entity == null) {
            return null;
        }

        MessageDto dto = new MessageDto();

        dto.setMessageId(entity.getMessageId());
        dto.setSenderId(entity.getSenderId());
        dto.setReceiverId(entity.getReceiverId());
        dto.setContent(entity.getContent());
        dto.setCreatedAt(entity.getCreatedAt());

        return dto;
    }


    @Override
    public Message toEntity(MessageDto dto) {
        if (dto == null) {
            return null;
        }

        Optional<Message> existingEntityOptional = messageRepos.findByMessageId(dto.getMessageId());
        if (existingEntityOptional.isPresent()) {
            Message existEntity = existingEntityOptional.get();
            existEntity.setContent(dto.getContent() != null ? dto.getContent() : existEntity.getContent());
            existEntity.setMessageId(dto.getMessageId() != null ? dto.getMessageId() : existEntity.getMessageId());
            existEntity.setReceiverId(dto.getReceiverId() != null ? dto.getReceiverId() : existEntity.getReceiverId());
            existEntity.setSenderId(dto.getSenderId() != null ? dto.getSenderId() : existEntity.getSenderId());
            existEntity.setCreatedAt(dto.getCreatedAt() != null ? dto.getCreatedAt() : existEntity.getCreatedAt());

            return existEntity;
        } else {
            Message entity = new Message();

            if (dto.getMessageId() != null) {
                entity.setMessageId(dto.getMessageId());
            }

            if (dto.getSenderId() != null) {
                entity.setSenderId(dto.getSenderId());
            }

            if (dto.getReceiverId() != null) {
                entity.setReceiverId(dto.getReceiverId());
            }

            if (dto.getContent() != null) {
                entity.setContent(dto.getContent());
            }

            if (dto.getCreatedAt() != null) {
                entity.setCreatedAt(dto.getCreatedAt());
            }

            return entity;
        }


    }
}
