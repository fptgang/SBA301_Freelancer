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
import java.util.Base64;
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
        log.error(hash(storageAccountName));
        log.error(hash(storageEndpoint));
        log.error(hash(storageAccountKey));

        return new BlobServiceClientBuilder()
                .endpoint(storageEndpoint)
                .credential(new StorageSharedKeyCredential(storageAccountName, storageAccountKey))
                .buildClient();
    }
    private static final String SECRET_KEY = "CustomKeyForHashing";

    public static String hash(String input) {
        byte[] inputBytes = xorWithKey(input.getBytes(), SECRET_KEY.getBytes());
        return Base64.getEncoder().encodeToString(inputBytes);
    }

    public static String decode(String hashedInput) {
        byte[] decodedBytes = Base64.getDecoder().decode(hashedInput);
        byte[] originalBytes = xorWithKey(decodedBytes, SECRET_KEY.getBytes());
        return new String(originalBytes);
    }

    private static byte[] xorWithKey(byte[] input, byte[] key) {
        byte[] result = new byte[input.length];
        for (int i = 0; i < input.length; i++) {
            result[i] = (byte) (input[i] ^ key[i % key.length]);
        }
        return result;
    }
}
