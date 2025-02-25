package com.fptgang.backend.repository;

import com.fptgang.backend.model.File;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepos extends JpaRepository<File, Long>, JpaSpecificationExecutor<File> {
    Optional<File> findByFileId(Long fileId);

    // Methods to find files by entity and visibility
    List<File> findByProject_ProjectIdAndIsVisibleTrue(Long projectId);
    List<File> findByProposal_ProposalIdAndIsVisibleTrue(Long proposalId);
    List<File> findByMessage_MessageIdAndIsVisibleTrue(Long messageId);
    List<File> findByMilestone_MilestoneIdAndIsVisibleTrue(Long milestoneId);

    // Methods to find all files by entity (including invisible ones)
    List<File> findByProject_ProjectId(Long projectId);
    List<File> findByProposal_ProposalId(Long proposalId);
    List<File> findByMessage_MessageId(Long messageId);
    List<File> findByMilestone_MilestoneId(Long milestoneId);

    // Method to find files by uploader
    List<File> findByUploader_AccountIdAndIsVisibleTrue(Long uploaderId);
}