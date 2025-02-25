package com.fptgang.backend.service.impl;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.fptgang.backend.service.AzureBlobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;

@Service
public class AzureBlobServiceImpl implements AzureBlobService {

    @Value("${COMPANY_NAME}")
    private String containerName;

    private final BlobServiceClient blobServiceClient;

    @Autowired
    public AzureBlobServiceImpl(BlobServiceClient blobServiceClient) {
        this.blobServiceClient = blobServiceClient;
    }

    // In AzureBlobServiceImpl class
    private String sanitizeFilename(String blobName) {
        if (blobName == null || blobName.isEmpty()) {
            throw new IllegalArgumentException("Blob name cannot be null or empty");
        }

        // Remove any BOM or invisible characters
        blobName = blobName.trim().replaceAll("\\p{C}", "");

        // Replace invalid characters with underscores
        // Only allow letters, numbers, dashes, underscores, and periods
        String sanitized = blobName.replaceAll("[^a-zA-Z0-9\\-_\\.]", "_");

        // Ensure filename doesn't start or end with a period
        sanitized = sanitized.replaceAll("^\\.", "_")
                .replaceAll("\\.$", "_");

        // Replace consecutive dots/underscores/dashes with a single underscore
        sanitized = sanitized.replaceAll("[\\.\\-_]{2,}", "_");

        // Ensure the length is within Azure's limits (1-1024 characters)
        if (sanitized.length() > 1024) {
            sanitized = sanitized.substring(0, 1024);
        }

        // Ensure we still have a valid filename after sanitization
        if (sanitized.isEmpty()) {
            sanitized = "file_" + System.currentTimeMillis();
        }

        return sanitized;
    }
    @Override
    public String upload(MultipartFile file, String blobName) throws IOException {
        // Sanitize the blob name before upload
        String sanitizedBlobName = sanitizeFilename(blobName);

        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerName);
        BlobClient blobClient = containerClient.getBlobClient(sanitizedBlobName);
        InputStream dataStream = file.getInputStream();
        blobClient.upload(dataStream, file.getSize(), true);
        return blobClient.getBlobUrl();
    }
}