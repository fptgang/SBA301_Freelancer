package com.fptgang.backend.service.impl;

import com.fptgang.backend.model.File;
import com.fptgang.backend.repository.FileRepos;
import com.fptgang.backend.service.AzureBlobService;
import com.fptgang.backend.service.FileService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.OpenApiHelper;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@Slf4j
public class FileServiceImpl implements FileService {

    private final AzureBlobService azureBlobService;
    private final FileRepos fileRepos;

    @Autowired
    public FileServiceImpl(FileRepos fileRepos, AzureBlobService azureBlobService) {
        this.fileRepos = fileRepos;
        this.azureBlobService = azureBlobService;
    }

    @Override
    @Transactional
    public File create(File file, MultipartFile multipartFile) {
        if (file.getFileName() == null)
            file.setFileName(multipartFile.getOriginalFilename());

        if (file.getFileName() == null) { // Fallback again
            file.setFileName(UUID.randomUUID().toString());
        } else { // add a random suffix to avoid duplication
            file.setFileName(file.getFileName() + "-" + RandomStringUtils.secure().nextAlphanumeric(6));
        }

        if (file.getFileType() == null) {
            file.setFileType(multipartFile.getContentType() == null ? "N/A" : multipartFile.getContentType());
        }

        try {
            String fileUrl = azureBlobService.upload(multipartFile, file.getFileName());
            file.setFileUrl(fileUrl);
            return fileRepos.save(file);
        } catch (IOException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @Override
    public File findById(long id) {
        return fileRepos.findById(id).orElse(null);
    }

    @Override
    @Transactional
    public File update(File file, MultipartFile multipartFile) {
        if (file.getFileId() == null) {
            throw new IllegalArgumentException("File does not exist");
        }
        if (file.getFileName() == null)
            file.setFileName(multipartFile.getOriginalFilename());

        if (file.getFileName() == null) { // Fallback again
            file.setFileName(UUID.randomUUID().toString());
        } else { // add a random suffix to avoid duplication
            file.setFileName(file.getFileName() + "-" + RandomStringUtils.secure().nextAlphanumeric(6));
        }

        if (file.getFileType() == null) {
            file.setFileType(multipartFile.getContentType() == null ? "N/A" : multipartFile.getContentType());
        }

        if (file.getFileType() == null) {
            file.setFileType(multipartFile.getContentType() == null ? "N/A" : multipartFile.getContentType());
        }

        try {
            String fileUrl = azureBlobService.upload(multipartFile, file.getFileName());
            file.setFileUrl(fileUrl);
            return fileRepos.save(file);
        } catch (IOException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @Override
    public File deleteById(long id) {
        File file = fileRepos.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("File does not exist"));
        file.setIsVisible(false);
        return fileRepos.save(file);
    }

    @Override
    public Page<File> getAll(ListParams params) {
        var spec = OpenApiHelper.groupBy( params.<File>toSpec(), "fileId");
        return fileRepos.findAll(spec, params.getPageable());
    }
}