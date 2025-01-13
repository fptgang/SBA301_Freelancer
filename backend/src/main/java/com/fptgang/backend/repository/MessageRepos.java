package com.fptgang.backend.repository;

import com.fptgang.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MessageRepos extends JpaRepository<Message,Long> {
    Optional<Message> findByMessageId(Long messageId);
}
