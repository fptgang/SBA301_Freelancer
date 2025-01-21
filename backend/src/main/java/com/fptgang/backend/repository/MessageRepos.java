package com.fptgang.backend.repository;

import com.fptgang.backend.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MessageRepos extends JpaRepository<Message, Long>, JpaSpecificationExecutor<Message> {
    Optional<Message> findByMessageId(Long messageId);

    @Query("SELECT m FROM Message m WHERE (m.receiver.accountId = ?1 OR m.sender.accountId = ?1) AND m.createdAt = (SELECT MAX(m2.createdAt) FROM Message m2 WHERE m2.sender = m.sender AND m2.receiver = m.receiver)")
    Page<Message> findAllBySenderOrReceiver(Long accountId, Pageable pageable, Specification<Message> spec);
}