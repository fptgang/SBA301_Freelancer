package com.fptgang.backend.service;

import com.fptgang.backend.model.File;
import com.fptgang.backend.repository.FileRepos;
import com.fptgang.backend.service.impl.FileServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FileServiceTest {

    @Mock
    private AzureBlobService azureBlobService;

    @Mock
    private FileRepos fileRepos;

    @InjectMocks
    private FileServiceImpl fileService;

    @Mock
    private MultipartFile multipartFile;

    private File file;

    @BeforeEach
    void setUp() {
        file = new File();
        file.setFileId(1L);
        file.setFileName("test.txt");
        file.setFileUrl("https://test.blob.core.windows.net/test.txt");
        file.setVisible(true);
    }

    @Test
    void createFile_ShouldReturnSavedFile() throws IOException {
        // Arrange
        when(azureBlobService.upload(any(MultipartFile.class), isNull()))
                .thenReturn("https://test.blob.core.windows.net/test.txt");

        when(fileRepos.save(any(File.class))).thenReturn(file);

        // Act
        File savedFile = fileService.create(file, multipartFile);

        // Assert
        assertNotNull(savedFile);
        assertEquals("https://test.blob.core.windows.net/test.txt", savedFile.getFileUrl());
        verify(fileRepos, times(1)).save(any(File.class));
    }

    @Test
    void findById_ShouldReturnFile_WhenFileExists() {
        // Arrange
        when(fileRepos.findById(1L)).thenReturn(java.util.Optional.of(file));

        // Act
        File foundFile = fileService.findById(1L);

        // Assert
        assertNotNull(foundFile);
        assertEquals(1L, foundFile.getFileId());
    }

    @Test
    void findById_ShouldReturnNull_WhenFileDoesNotExist() {
        // Arrange
        when(fileRepos.findById(2L)).thenReturn(java.util.Optional.empty());

        // Act
        File foundFile = fileService.findById(2L);

        // Assert
        assertNull(foundFile);
    }

    @Test
    void updateFile_ShouldReturnUpdatedFile() throws IOException {
        // Arrange
        when(azureBlobService.upload(any(MultipartFile.class), isNull()))
                .thenReturn("https://test.blob.core.windows.net/updated.txt");

        when(fileRepos.save(any(File.class))).thenReturn(file);

        // Act
        File updatedFile = fileService.update(file, multipartFile);

        // Assert
        assertNotNull(updatedFile);
        assertEquals("https://test.blob.core.windows.net/updated.txt", updatedFile.getFileUrl());
    }

    @Test
    void deleteById_ShouldSetFileInvisible() {
        // Arrange
        when(fileRepos.findById(1L)).thenReturn(java.util.Optional.of(file));
        when(fileRepos.save(any(File.class))).thenReturn(file);

        // Act
        File deletedFile = fileService.deleteById(1L);

        // Assert
        assertFalse(deletedFile.isVisible());
        verify(fileRepos, times(1)).save(file);
    }

    @Test
    void deleteById_ShouldThrowException_WhenFileDoesNotExist() {
        // Arrange
        when(fileRepos.findById(2L)).thenReturn(java.util.Optional.empty());

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> fileService.deleteById(2L));
    }
}
