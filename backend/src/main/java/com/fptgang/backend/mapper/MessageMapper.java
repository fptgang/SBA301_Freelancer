package com.fptgang.backend.mapper;



import com.fptgang.backend.api.model.MessageDto;
import com.fptgang.model.Message;

public class MessageMapper extends BaseMapper<MessageDto,Message> {

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
