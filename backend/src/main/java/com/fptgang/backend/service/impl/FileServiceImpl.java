package com.fptgang.backend.service.impl;

import com.fptgang.backend.model.File;
import com.fptgang.backend.repository.FileRepos;
import com.fptgang.backend.service.AzureBlobService;
import com.fptgang.backend.service.FileService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.OpenApiHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@Slf4j
public class FileServiceImpl implements FileService {

    private final AzureBlobService azureBlobService;
    private final FileRepos fileRepos;

    @Autowired
    public FileServiceImpl(FileRepos fileRepos, AzureBlobService azureBlobService) {
        this.fileRepos = fileRepos;
        this.azureBlobService = azureBlobService;
    }

    @Override
    public File create(File image, MultipartFile file) {
        try {
            // Get original filename and sanitize it
            String originalFilename = file.getOriginalFilename();
            String safeFilename = sanitizeFilename(originalFilename);

            // Set the filename in the File entity
            image.setFileName("");

            // Upload the file with the safe filename
            image.setFileUrl(azureBlobService.upload(file, safeFilename));
            return fileRepos.save(image);
        } catch (IOException e) {
            log.error("Failed to upload file: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @Override
    public File update(File file, MultipartFile blob) {
        if (file.getFileId() == null) {
            throw new IllegalArgumentException("File does not exist");
        }
        try {
            // Get original filename and sanitize it
            String originalFilename = blob.getOriginalFilename();
            String safeFilename = sanitizeFilename(originalFilename);

            // Set the filename in the File entity
            file.setFileName(safeFilename);

            // Upload with safe filename
            file.setFileUrl(azureBlobService.upload(blob, safeFilename));
            return fileRepos.save(file);
        } catch (IOException e) {
            log.error("Failed to update file: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * Sanitizes filename for Azure Blob Storage compatibility
     */
    private String sanitizeFilename(String filename) {
        if (filename == null || filename.trim().isEmpty()) {
            return "file_" + UUID.randomUUID();
        }

        // Replace invalid characters with underscores
        String sanitized = filename.replaceAll("[\\\\/:*?\"<>|]", "_");

        // Remove any leading/trailing whitespaces
        sanitized = sanitized.trim();

        // Handle folder structure if needed (preserving path separators)
        sanitized = sanitized.replace('\\', '/');

        // Ensure the name isn't empty after sanitization
        if (sanitized.isEmpty()) {
            sanitized = "file_" + UUID.randomUUID();
        }

        return sanitized;
    }

    @Override
    public File findById(long id) {
        return fileRepos.findById(id).orElse(null);
    }

    @Override
    public File deleteById(long id) {
        File file = fileRepos.findById(id)
                             .orElseThrow(() -> new IllegalArgumentException("File does not exist"));
        file.setIsVisible(false);
        return fileRepos.save(file);
    }

    @Override
    public Page<File> getAll(ListParams params) {
        var spec = OpenApiHelper.groupBy(params.<File>toSpec(), "fileId");
        return fileRepos.findAll(spec, params.getPageable());
    }
}