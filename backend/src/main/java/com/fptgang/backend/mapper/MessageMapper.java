package com.fptgang.backend.mapper;


import com.fptgang.backend.api.model.MessageDto;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.MessageRepos;
import com.fptgang.backend.model.Message;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.Optional;

@Component
public class MessageMapper extends BaseMapper<MessageDto, Message> {

    @Autowired
    private MessageRepos messageRepos;

    @Autowired
    private AccountRepos accountRepos;

    @Override
    public MessageDto toDTO(Message entity) {
        if (entity == null) {
            return null;
        }

        MessageDto dto = new MessageDto();

        dto.setReceiverId(entity.getReceiver().getAccountId());
        dto.setSenderId(entity.getSender().getAccountId());
        dto.setMessageId(entity.getMessageId());
        dto.setContent(entity.getContent());
        dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));
        dto.setIsVisible(entity.isVisible());

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

            // NOTE: can only change visibility
            //existEntity.setContent(dto.getContent() != null ? dto.getContent() : existEntity.getContent());
            //existEntity.setReceiver(dto.getReceiverId() != null ? findAccount(dto.getReceiverId()) : existEntity.getReceiver());
            //existEntity.setSender(dto.getSenderId() != null ? findAccount(dto.getSenderId()) : existEntity.getSender());
            existEntity.setVisible(dto.getIsVisible() != null ? dto.getIsVisible() : existEntity.isVisible());

            return existEntity;
        } else {
            Message entity = new Message();
            entity.setMessageId(dto.getMessageId());

            if (dto.getContent() != null) {
                entity.setContent(dto.getContent());
            }

            if (dto.getReceiverId() != null) {
                entity.setReceiver(findAccount(dto.getReceiverId()));
            }
            if (dto.getSenderId() != null) {
                entity.setSender(findAccount(dto.getSenderId()));
            }
            if (dto.getIsVisible() != null) {
                entity.setVisible(dto.getIsVisible());
            }

            return entity;
        }
    }

    public Account findAccount(Long id) {
        return accountRepos.findByAccountId(id)
                .orElseThrow(() -> new IllegalArgumentException("Account does not exist"));
    }
}
