package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.FilesApi;
import com.fptgang.backend.api.controller.ProfilesApi;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.mapper.DetailLevel;
import com.fptgang.backend.mapper.FileMapper;
import com.fptgang.backend.mapper.ProfileMapper;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.service.FileService;
import com.fptgang.backend.service.ProfileService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.OpenApiHelper;
import com.fptgang.backend.util.SecurityUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1")
@Slf4j
public class FileController implements FilesApi {
    private final FileService fileService;
    private final FileMapper fileMapper;

    @Autowired
    public FileController(FileService fileService, FileMapper fileMapper) {
        this.fileService = fileService;
        this.fileMapper = fileMapper;
    }

    @Override
    public ResponseEntity<FileDto> uploadFile(Long uploaderId, MultipartFile blob,
                                              Boolean isVisible, Long messageId, Long proposalId, Long projectId, Long milestoneId) {
        return FilesApi.super.uploadFile(uploaderId, blob, isVisible, messageId, proposalId, projectId, milestoneId);
    }

    @Override
    public ResponseEntity<FileDto> updateFile(Long fileId, Long uploaderId, MultipartFile blob,
                                              Boolean isVisible, Long messageId, Long proposalId, Long projectId, Long milestoneId) {
        return FilesApi.super.updateFile(fileId, uploaderId, blob, isVisible, messageId, proposalId, projectId, milestoneId);
    }

    @Override
    public ResponseEntity<Void> deleteFile(Long fileId) {
        fileService.deleteById(fileId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
