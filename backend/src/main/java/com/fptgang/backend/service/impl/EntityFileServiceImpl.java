package com.fptgang.backend.service.impl;

import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.*;
import com.fptgang.backend.repository.*;
import com.fptgang.backend.service.AzureBlobService;
import com.fptgang.backend.service.EntityFileService;
import com.fptgang.backend.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service for handling file uploads across different entity types
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class EntityFileServiceImpl implements EntityFileService {

    private final FileRepos fileRepos;
    private final AccountRepos accountRepos;
    private final ProjectRepos projectRepos;
    private final ProposalRepos proposalRepos;
    private final MessageRepos messageRepos;
    private final MilestoneRepos milestoneRepos;
    private final AzureBlobService azureBlobService;

    /**
     * Uploads a file to Azure Blob Storage and associates it with the specified entity
     *
     * @param file The file to upload
     * @param entityType The type of entity to associate the file with
     * @param entityId The ID of the entity
     * @param description Optional description of the file
     * @return The saved File entity
     */
    @Override
    @Transactional
    public File uploadFile(MultipartFile file, EntityType entityType, Long entityId, String description, boolean isVisible) {
        // Validate inputs
        if (file == null || file.isEmpty()) {
            throw new InvalidInputException("File cannot be empty");
        }

        if (entityId == null) {
            throw new InvalidInputException("Entity ID is required");
        }

        // Get current user
        Long currentUserId = SecurityUtil.getCurrentUserId();
        if (currentUserId == null) {
            throw new InvalidInputException("User must be authenticated to upload files");
        }

        Account uploader = accountRepos.findByAccountId(currentUserId)
                .orElseThrow(() -> new InvalidInputException("User not found"));

        // Generate a unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFilename = generateUniqueFilename(entityType, entityId, fileExtension);

        // Create file entity
        File fileEntity = File.builder()
                .fileName(originalFilename)
                .fileType(file.getContentType())
                .size(file.getSize())
                .uploader(uploader)
                .isVisible(isVisible)
                .build();

        // Set appropriate entity reference based on entityType
        switch (entityType) {
            case PROJECT:
                Project project = projectRepos.findByProjectId(entityId)
                        .orElseThrow(() -> new InvalidInputException("Project not found"));
                fileEntity.setProject(project);
                validateUserPermission(uploader, project);
                break;

            case PROPOSAL:
                Proposal proposal = proposalRepos.findByProposalId(entityId)
                        .orElseThrow(() -> new InvalidInputException("Proposal not found"));
                fileEntity.setProposal(proposal);
                validateUserPermission(uploader, proposal);
                break;

            case MESSAGE:
                Message message = messageRepos.findByMessageId(entityId)
                        .orElseThrow(() -> new InvalidInputException("Message not found"));
                fileEntity.setMessage(message);
                validateUserPermission(uploader, message);
                break;

            case MILESTONE:
                Milestone milestone = milestoneRepos.findByMilestoneId(entityId)
                        .orElseThrow(() -> new InvalidInputException("Milestone not found"));
                fileEntity.setMilestone(milestone);
                validateUserPermission(uploader, milestone);
                break;

            default:
                throw new InvalidInputException("Unsupported entity type: " + entityType);
        }

        try {
            // Upload file to Azure Blob Storage
            String fileUrl = azureBlobService.upload(file, uniqueFilename);
            fileEntity.setFileUrl(fileUrl);

            // Save file entity to database
            return fileRepos.save(fileEntity);
        } catch (IOException e) {
            log.error("Failed to upload file: {}", e.getMessage(), e);
            throw new InvalidInputException("Failed to upload file: " + e.getMessage());
        }
    }

    /**
     * Uploads multiple files and associates them with the specified entity
     *
     * @param files The files to upload
     * @param entityType The type of entity to associate the files with
     * @param entityId The ID of the entity
     * @return List of saved File entities
     */
    @Override
    @Transactional
    public List<File> uploadFiles(List<MultipartFile> files, EntityType entityType, Long entityId, boolean isVisible) {
        if (files == null || files.isEmpty()) {
            throw new InvalidInputException("No files provided for upload");
        }

        List<File> uploadedFiles = new ArrayList<>();
        for (MultipartFile file : files) {
            File uploadedFile = uploadFile(file, entityType, entityId, null, isVisible);
            uploadedFiles.add(uploadedFile);
        }

        return uploadedFiles;
    }

    /**
     * Deletes a file by ID
     *
     * @param fileId The ID of the file to delete
     */
    @Override
    @Transactional
    public void deleteFile(Long fileId) {
        File file = fileRepos.findByFileId(fileId)
                .orElseThrow(() -> new InvalidInputException("File not found"));

        // Validate that current user has permission to delete this file
        Long currentUserId = SecurityUtil.getCurrentUserId();
        if (currentUserId == null) {
            throw new InvalidInputException("User must be authenticated to delete files");
        }

        // Only file uploader, entity owner, or admin can delete files
        if (!file.getUploader().getAccountId().equals(currentUserId) &&
                !isEntityOwner(file, currentUserId) &&
                !SecurityUtil.hasPermission(Role.ADMIN)) {
            throw new InvalidInputException("You don't have permission to delete this file");
        }

        // Soft delete by setting visibility to false
        file.setVisible(false);
        fileRepos.save(file);
    }

    /**
     * Retrieves all files associated with a specific entity
     *
     * @param entityType The type of entity
     * @param entityId The ID of the entity
     * @return List of files associated with the entity
     */
    @Override
    public List<File> getFilesByEntity(EntityType entityType, Long entityId) {
        switch (entityType) {
            case PROJECT:
                return fileRepos.findByProject_ProjectIdAndIsVisibleTrue(entityId);

            case PROPOSAL:
                return fileRepos.findByProposal_ProposalIdAndIsVisibleTrue(entityId);

            case MESSAGE:
                return fileRepos.findByMessage_MessageIdAndIsVisibleTrue(entityId);

            case MILESTONE:
                return fileRepos.findByMilestone_MilestoneIdAndIsVisibleTrue(entityId);

            default:
                throw new InvalidInputException("Unsupported entity type: " + entityType);
        }
    }

    // Helper methods

    private String getFileExtension(String filename) {
        if (filename == null) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        return (lastDotIndex == -1) ? "" : filename.substring(lastDotIndex);
    }

    private String generateUniqueFilename(EntityType entityType, Long entityId, String extension) {
        return entityType.name().toLowerCase() + "_" + entityId + "_" + UUID.randomUUID() + extension;
    }

    private void validateUserPermission(Account uploader, Project project) {
        // Project files can be uploaded by project owner, project staff, or admin
        if (!project.getClient().getAccountId().equals(uploader.getAccountId()) &&
                (project.getStaff() == null || !project.getStaff().getAccountId().equals(uploader.getAccountId())) &&
                !SecurityUtil.hasPermission(Role.ADMIN)) {
            throw new InvalidInputException("You don't have permission to upload files to this project");
        }
    }

    private void validateUserPermission(Account uploader, Proposal proposal) {
        // Proposal files can be uploaded by the freelancer who created the proposal, project owner, or admin
        if (!proposal.getFreelancer().getAccountId().equals(uploader.getAccountId()) &&
                !proposal.getProject().getClient().getAccountId().equals(uploader.getAccountId()) &&
                !SecurityUtil.hasPermission(Role.ADMIN)) {
            throw new InvalidInputException("You don't have permission to upload files to this proposal");
        }
    }

    private void validateUserPermission(Account uploader, Message message) {
        // Message files can be uploaded by the message sender or admin
        if (!message.getSender().getAccountId().equals(uploader.getAccountId()) &&
                !SecurityUtil.hasPermission(Role.ADMIN)) {
            throw new InvalidInputException("You don't have permission to upload files to this message");
        }
    }

    private void validateUserPermission(Account uploader, Milestone milestone) {
        // Milestone files can be uploaded by project owner, freelancer associated with the project, or admin
        Project project = milestone.getProject();
        boolean isFreelancer = project.getActiveProposal() != null &&
                project.getActiveProposal().getFreelancer().getAccountId().equals(uploader.getAccountId());

        if (!project.getClient().getAccountId().equals(uploader.getAccountId()) &&
                !isFreelancer &&
                !SecurityUtil.hasPermission(Role.ADMIN)) {
            throw new InvalidInputException("You don't have permission to upload files to this milestone");
        }
    }

    private boolean isEntityOwner(File file, Long userId) {
        if (file.getProject() != null && file.getProject().getClient().getAccountId().equals(userId)) {
            return true;
        }

        if (file.getProposal() != null && file.getProposal().getFreelancer().getAccountId().equals(userId)) {
            return true;
        }

        if (file.getMessage() != null && file.getMessage().getSender().getAccountId().equals(userId)) {
            return true;
        }

        return false;
    }
}