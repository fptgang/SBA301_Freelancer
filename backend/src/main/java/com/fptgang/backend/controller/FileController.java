package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.FilesApi;
import com.fptgang.backend.api.controller.ProfilesApi;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.mapper.FileMapper;
import com.fptgang.backend.mapper.ProfileMapper;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.service.FileService;
import com.fptgang.backend.service.ProfileService;
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
    public ResponseEntity<Void> deleteFile(Long fileId) {
        fileService.deleteById(fileId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<FileDto> getFileById(Long fileId) {
        return new ResponseEntity<>(fileMapper.toDTO(fileService.findById(fileId)), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<GetFiles200Response> getFiles(Pageable pageable, String filter, String search) {
        var page = OpenApiHelper.toPageable(pageable);
        var includeInvisible = SecurityUtil.hasPermission(Role.ADMIN);
        var res = fileService.getAll(page, filter, search, includeInvisible).map(fileMapper::toDTO);
        return OpenApiHelper.respondPage(res, GetFiles200Response.class);
    }
}
