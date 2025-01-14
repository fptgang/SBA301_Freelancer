package com.fptgang.backend.service;

import com.fptgang.backend.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MessageService {
    Message create(Message message);
    Message update(Message message);
    Message findByProjectCategoryId(long messageId);
    void deleteById(long messageId);
    Page<Message> getAll(Pageable pageable, String filter);
}