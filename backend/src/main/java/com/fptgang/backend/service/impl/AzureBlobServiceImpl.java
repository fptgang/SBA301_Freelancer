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

    @Override
    public String upload(MultipartFile file, String blobName) throws IOException {
        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerName);
        BlobClient blobClient = containerClient.getBlobClient(blobName);
        InputStream dataStream = file.getInputStream();
        blobClient.upload(dataStream, file.getSize(), true);
        return blobClient.getBlobUrl();
    }
}