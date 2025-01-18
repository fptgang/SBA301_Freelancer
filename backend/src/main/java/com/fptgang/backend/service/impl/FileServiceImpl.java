package com.fptgang.backend.service.impl;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.File;
import com.fptgang.backend.model.Message;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.model.Proposal;
import com.fptgang.backend.repository.FileRepos;
import com.fptgang.backend.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

    @Value("${COMPANY_NAME}")
    private String containerName;

    private final BlobServiceClient blobServiceClient;

    private final FileRepos fileRepos;

    private BlobContainerClient getContainerClient() {
        return blobServiceClient.getBlobContainerClient(containerName);
    }

    private BlobClient getBlobClient(String fileName) {
        return getContainerClient().getBlobClient(fileName);
    }

    @Override
    public File uploadFile(long accountId, String fileName, byte[] fileContent, Object object) {
        validateInput(object, fileContent, fileName);
        // Upload file to Azure Blob Storage
        try (ByteArrayInputStream dataStream = new ByteArrayInputStream(fileContent)) {
            getBlobClient(fileName).upload(dataStream, fileContent.length, true);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }
        File file =  buildFileEntity(fileName, fileContent, object);
        return fileRepos.save(file);
    }

    private void validateInput(Object object, byte[] fileContent, String fileName) {
        if (!(object instanceof Project || object instanceof Proposal || object instanceof Message)) {
            throw new InvalidInputException("Object must be instance of Project, Proposal, or Message");
        }
        if (Objects.isNull(fileContent) || fileContent.length == 0) {
            throw new InvalidInputException("File content cannot be empty");
        }
        if (Objects.isNull(fileName) || fileName.trim().isEmpty()) {
            throw new InvalidInputException("File name cannot be empty");
        }
    }

    private File buildFileEntity(String fileName, byte[] fileContent, Object object) {
        return File.builder()
                .fileName(fileName)
                .fileUrl(getBlobClient(fileName).getBlobUrl())
                .fileType(getBlobClient(fileName).getBlobUrl().split("\\.")[1])
                .isVisible(true)
                .project(object instanceof Project ? (Project) object : null)
                .proposal(object instanceof Proposal ? (Proposal) object : null)
                .message(object instanceof Message ? (Message) object : null)
                .fileId((long) getBlobClient(fileName).getBlobUrl().hashCode())
                .size(fileContent.length)
                .build();
    }

    @Override
    public void deleteFile(long accountId, String fileName) {
        try {
            getBlobClient(fileName).deleteIfExists();
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete file: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteAllFiles(long accountId) {
        try {
            getContainerClient().deleteIfExists();
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete container: " + e.getMessage(), e);
        }
    }
}