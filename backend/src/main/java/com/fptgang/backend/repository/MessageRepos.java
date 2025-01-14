package com.fptgang.backend.repository;

import com.fptgang.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface MessageRepos extends JpaRepository<Message,Long>, JpaSpecificationExecutor<Message> {
    Optional<Message> findByMessageId(Long messageId);
}
