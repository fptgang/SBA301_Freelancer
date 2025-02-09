package com.fptgang.backend.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface AzureBlobService {
    String upload(MultipartFile file, String blobName) throws IOException;
}
