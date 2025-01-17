package com.fptgang.backend.config;

import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.common.StorageSharedKeyCredential;
import org.springframework.stereotype.Component;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AzureConfig {


    @Value("${azure.storage-account-name}")
    private String storageAccountName;

    @Value("${azure.storage-account-key}")
    private String storageAccountKey;

    @Bean
    public BlobServiceClient blobServiceClient() {
        return new BlobServiceClientBuilder()
                .endpoint(String.format("https://%s.blob.core.windows.net", storageAccountName))
                .credential(new StorageSharedKeyCredential(storageAccountName, storageAccountKey))
                .buildClient();
    }
}
