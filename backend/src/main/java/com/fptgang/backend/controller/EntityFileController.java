package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.EntityFilesApi;
import com.fptgang.backend.api.model.FileDto;
import com.fptgang.backend.mapper.DetailLevel;
import com.fptgang.backend.mapper.FileMapper;
import com.fptgang.backend.service.EntityFileService;
import com.fptgang.backend.service.EntityFileService.EntityType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
@Slf4j
@RequiredArgsConstructor
public class EntityFileController implements EntityFilesApi {

    private final EntityFileService entityFileService;
    private final FileMapper fileMapper;



    @Override
    public ResponseEntity<List<FileDto>> uploadEntityFiles(
            String entityTypeStr,
            Long entityId,
            List<MultipartFile> files,
            Boolean isVisible) {

        log.info("Uploading {} files for {} with ID {}", files.size(), entityTypeStr, entityId);
        try {
            EntityType entityType = EntityType.valueOf(entityTypeStr.toUpperCase());
            var uploadedFiles = entityFileService.uploadFiles(files, entityType, entityId, isVisible);

            var dtos = uploadedFiles.stream()
                    .map(file -> fileMapper.toDTO(file, DetailLevel.FULL))
                    .collect(Collectors.toList());

            return new ResponseEntity<>(dtos, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            log.error("Invalid entity type: {}", entityTypeStr, e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error uploading files for {} with ID {}: {}", entityTypeStr, entityId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Override
    public ResponseEntity<List<FileDto>> uploadEntityFilesBatch(String entityTypeStr, Long entityId, List<MultipartFile> files, Boolean isVisible) {
        log.info("Uploading batch of {} files for {} with ID {}", files.size(), entityTypeStr, entityId);

        try {
            EntityType entityType = EntityType.valueOf(entityTypeStr.toUpperCase());
            var uploadedFiles = entityFileService.uploadFiles(files, entityType, entityId, isVisible);

            var dtos = uploadedFiles.stream()
                    .map(file -> fileMapper.toDTO(file, DetailLevel.FULL))
                    .collect(Collectors.toList());

            return new ResponseEntity<>(dtos, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            log.error("Invalid entity type: {}", entityTypeStr, e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error uploading files for {} with ID {}: {}", entityTypeStr, entityId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Override
    public ResponseEntity<List<FileDto>> getEntityFiles(
            String entityTypeStr,
            Long entityId) {

        log.info("Getting files for {} with ID {}", entityTypeStr, entityId);

        try {
            EntityType entityType = EntityType.valueOf(entityTypeStr.toUpperCase());
            var files = entityFileService.getFilesByEntity(entityType, entityId);

            var dtos = files.stream()
                    .map(file -> fileMapper.toDTO(file, DetailLevel.FULL))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dtos);
        } catch (IllegalArgumentException e) {
            log.error("Invalid entity type: {}", entityTypeStr, e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error getting files for {} with ID {}: {}", entityTypeStr, entityId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

//    @Override
//    public ResponseEntity<Void> deleteEntityFile(Long fileId) {
//        log.info("Deleting file with ID {}", fileId);
//
//        try {
//            entityFileService.deleteFile(fileId);
//            return ResponseEntity.noContent().build();
//        } catch (Exception e) {
//            log.error("Error deleting file with ID {}: {}", fileId, e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
}