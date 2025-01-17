package com.fptgang.backend.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.File;
import com.fptgang.backend.model.Message;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.model.Proposal;
import com.fptgang.backend.repository.FileRepos;
import com.fptgang.backend.service.impl.FileServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.ByteArrayInputStream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FileServiceTest {

    @Mock
    private BlobServiceClient blobServiceClient;

    @Mock
    private FileRepos fileRepos;

    @Mock
    private BlobContainerClient containerClient;

    @Mock
    private BlobClient blobClient;

    @InjectMocks
    private FileServiceImpl fileService;

    private static final String CONTAINER_NAME = "testContainer";
    private static final String FILE_NAME = "test.txt";
    private static final byte[] FILE_CONTENT = "test content".getBytes();
    private static final String BLOB_URL = "https://test.blob.core.windows.net/test.txt";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(fileService, "containerName", CONTAINER_NAME);
    }

    @Test
    void uploadFile_WithValidProjectInput_ShouldSucceed() {
        // Arrange
        setupBlobMocks();
        Project project = new Project();
        File expectedFile = File.builder()
                .fileName(FILE_NAME)
                .fileUrl(BLOB_URL)
                .fileType("txt")
                .isVisible(true)
                .project(project)
                .fileId((long) BLOB_URL.hashCode())
                .size(FILE_CONTENT.length)
                .build();

        when(fileRepos.save(any(File.class))).thenReturn(expectedFile);
        doNothing().when(blobClient).upload(any(ByteArrayInputStream.class), anyLong(), anyBoolean());

        // Act
        File result = fileService.uploadFile(1L, FILE_NAME, FILE_CONTENT, project);

        // Assert
        assertNotNull(result);
        assertEquals(expectedFile.getFileName(), result.getFileName());
        assertEquals(expectedFile.getFileUrl(), result.getFileUrl());
        assertEquals(expectedFile.getFileType(), result.getFileType());
        verify(blobClient).upload(any(ByteArrayInputStream.class), eq((long) FILE_CONTENT.length), eq(true));
        verify(fileRepos).save(any(File.class));
    }

    private void setupBlobMocks() {
        when(blobServiceClient.getBlobContainerClient(CONTAINER_NAME)).thenReturn(containerClient);
        when(containerClient.getBlobClient(FILE_NAME)).thenReturn(blobClient);
        when(blobClient.getBlobUrl()).thenReturn(BLOB_URL);
    }

    @Test
    void uploadFile_WithNullContent_ShouldThrowException() {
        // Arrange
        Project project = new Project();

        // Act & Assert
        assertThrows(InvalidInputException.class,
                () -> fileService.uploadFile(1L, FILE_NAME, null, project),
                "File content cannot be empty");
    }

    @Test
    void uploadFile_WithEmptyFileName_ShouldThrowException() {
        // Arrange
        Project project = new Project();

        // Act & Assert
        assertThrows(InvalidInputException.class,
                () -> fileService.uploadFile(1L, "", FILE_CONTENT, project),
                "File name cannot be empty");
    }

    @Test
    void uploadFile_WithInvalidObjectType_ShouldThrowException() {
        // Arrange
        Object invalidObject = new Object();

        // Act & Assert
        assertThrows(InvalidInputException.class,
                () -> fileService.uploadFile(1L, FILE_NAME, FILE_CONTENT, invalidObject),
                "Object must be instance of Project, Proposal, or Message");
    }




    @Test
    void deleteAllFiles_ShouldSucceed() {
        // Arrange
        when(blobServiceClient.getBlobContainerClient(CONTAINER_NAME)).thenReturn(containerClient);
        when(containerClient.deleteIfExists()).thenReturn(true);

        // Act
        fileService.deleteAllFiles(1L);

        // Assert
        verify(containerClient).deleteIfExists();
    }

    @Test
    void deleteAllFiles_WhenExceptionOccurs_ShouldThrowRuntimeException() {
        // Arrange
        when(blobServiceClient.getBlobContainerClient(CONTAINER_NAME)).thenReturn(containerClient);
        when(containerClient.deleteIfExists()).thenThrow(new RuntimeException("Azure error"));

        // Act & Assert
        assertThrows(RuntimeException.class,
                () -> fileService.deleteAllFiles(1L),
                "Failed to delete container: Azure error");
    }

    @Test
    void uploadFile_WithProposal_ShouldSucceed() {
        // Arrange
        setupBlobMocks();
        Proposal proposal = new Proposal();
        File expectedFile = File.builder()
                .fileName(FILE_NAME)
                .fileUrl(BLOB_URL)
                .fileType("txt")
                .isVisible(true)
                .proposal(proposal)
                .fileId((long) BLOB_URL.hashCode())
                .size(FILE_CONTENT.length)
                .build();

        when(fileRepos.save(any(File.class))).thenReturn(expectedFile);
        doNothing().when(blobClient).upload(any(ByteArrayInputStream.class), anyLong(), anyBoolean());

        // Act
        File result = fileService.uploadFile(1L, FILE_NAME, FILE_CONTENT, proposal);

        // Assert
        assertNotNull(result);
        assertEquals(expectedFile.getFileName(), result.getFileName());
        assertEquals(expectedFile.getProposal(), proposal);
        verify(fileRepos).save(any(File.class));
    }

    @Test
    void uploadFile_WithMessage_ShouldSucceed() {
        // Arrange
        setupBlobMocks();
        Message message = new Message();
        File expectedFile = File.builder()
                .fileName(FILE_NAME)
                .fileUrl(BLOB_URL)
                .fileType("txt")
                .isVisible(true)
                .message(message)
                .fileId((long) BLOB_URL.hashCode())
                .size(FILE_CONTENT.length)
                .build();

        when(fileRepos.save(any(File.class))).thenReturn(expectedFile);
        doNothing().when(blobClient).upload(any(ByteArrayInputStream.class), anyLong(), anyBoolean());

        // Act
        File result = fileService.uploadFile(1L, FILE_NAME, FILE_CONTENT, message);

        // Assert
        assertNotNull(result);
        assertEquals(expectedFile.getFileName(), result.getFileName());
        assertEquals(expectedFile.getMessage(), message);
        verify(fileRepos).save(any(File.class));
    }
}