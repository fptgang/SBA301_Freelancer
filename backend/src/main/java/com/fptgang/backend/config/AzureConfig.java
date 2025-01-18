package com.fptgang.backend.config;

import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.common.StorageSharedKeyCredential;
import com.fptgang.backend.util.FileUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Configuration
@Slf4j
public class AzureConfig {


    @Value("${spring.cloud.azure.storage.blob.account-name}")
    private String storageAccountName;
    @Value("${spring.cloud.azure.storage.blob.endpoint}")
    private String storageEndpoint;

    @Value("${spring.cloud.azure.storage.account-key}")
    private String storageAccountKey;

    @Bean
    public BlobServiceClient blobServiceClient() {
        log.error(FileUtils.encodeBase64(storageAccountName.getBytes(StandardCharsets.UTF_8)));
        log.error(FileUtils.encodeBase64(storageEndpoint.getBytes(StandardCharsets.UTF_8)));
        log.error(FileUtils.encodeBase64(storageAccountKey.getBytes(StandardCharsets.UTF_8)));

        return new BlobServiceClientBuilder()
                .endpoint(storageEndpoint)
                .credential(new StorageSharedKeyCredential(storageAccountName, storageAccountKey))
                .buildClient();
    }
}
