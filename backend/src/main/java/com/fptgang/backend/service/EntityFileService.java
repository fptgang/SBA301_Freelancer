package com.fptgang.backend.service;

import com.fptgang.backend.model.File;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service interface for handling entity-related file operations
 */
public interface EntityFileService {

    /**
     * Enum representing the different types of entities that can have files
     */
    enum EntityType {
        PROJECT,
        PROPOSAL,
        MESSAGE,
        MILESTONE
    }

    /**
     * Uploads a file to Azure Blob Storage and associates it with the specified entity
     *
     * @param file The file to upload
     * @param entityType The type of entity to associate the file with
     * @param entityId The ID of the entity
     * @param description Optional description of the file
     * @param isVisible Whether the file should be visible
     * @return The saved File entity
     */
    File uploadFile(MultipartFile file, EntityType entityType, Long entityId, String description, boolean isVisible);

    /**
     * Uploads multiple files and associates them with the specified entity
     *
     * @param files The files to upload
     * @param entityType The type of entity to associate the files with
     * @param entityId The ID of the entity
     * @param isVisible Whether the files should be visible
     * @return List of saved File entities
     */
    List<File> uploadFiles(List<MultipartFile> files, EntityType entityType, Long entityId, boolean isVisible);

    /**
     * Deletes a file by ID
     *
     * @param fileId The ID of the file to delete
     */
    void deleteFile(Long fileId);

    /**
     * Retrieves all files associated with a specific entity
     *
     * @param entityType The type of entity
     * @param entityId The ID of the entity
     * @return List of files associated with the entity
     */
    List<File> getFilesByEntity(EntityType entityType, Long entityId);
}