package com.fptgang.backend.repository;

import com.fptgang.backend.model.Message;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MessageRepos extends JpaRepository<Message, Long>, JpaSpecificationExecutor<Message> {
    Optional<Message> findByMessageId(Long messageId);

    @Query("""
            SELECT m FROM Message m WHERE m.project.projectId = :projectId
            AND m.isVisible = true ORDER BY m.messageId DESC LIMIT 1""")
    Optional<Message> findLatestVisibleMessageByProject(@Param("projectId") Long projectId);
}