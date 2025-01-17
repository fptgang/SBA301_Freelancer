package com.fptgang.backend.service.impl;

import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.Message;
import com.fptgang.backend.repository.MessageRepos;
import com.fptgang.backend.service.MessageService;
import com.fptgang.backend.util.OpenApiHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class MessageServiceImpl implements MessageService {
    @Autowired
    private MessageRepos messageRepos;

    @Override
    public Message create(Message message) {
        return messageRepos.save(message);
    }

    @Override
    public Message update(Message message) {
        if(message.getMessageId() == null || !messageRepos.existsById(message.getMessageId())){
            throw new InvalidInputException("Message does not exist");
        }
        return messageRepos.save(message);
    }

    @Override
    public Message findByMessageId(long messageId) {
        return messageRepos.findByMessageId(messageId).orElseThrow(
                () -> new InvalidInputException("Message with id " + messageId + "not found"));
    }

    @Override
    public void deleteById(long messageId) {
        Message message = messageRepos.findByMessageId(messageId).orElseThrow(
                () -> new InvalidInputException("Message with id " + messageId + "not found"));
        message.setVisible(false);
        messageRepos.save(message);
    }

    @Override
    public Page<Message> getAll(Pageable pageable, String filter) {
        var spec = OpenApiHelper.<Message>toSpecification(filter);
        return messageRepos.findAll(spec,pageable);
    }
}