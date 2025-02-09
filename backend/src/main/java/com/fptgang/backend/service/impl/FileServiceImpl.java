package com.fptgang.backend.service.impl;

import com.fptgang.backend.model.File;
import com.fptgang.backend.repository.FileRepos;
import com.fptgang.backend.service.AzureBlobService;
import com.fptgang.backend.service.FileService;
import com.fptgang.backend.util.OpenApiHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

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
    public File create(File image, MultipartFile file) {
        try {
            image.setFileUrl(azureBlobService.upload(file, file.getName()));
            return fileRepos.save(image);
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
    public File update(File file, MultipartFile blob) {
        if (file.getFileId() == null) {
            throw new IllegalArgumentException("File does not exist");
        }
        try {
            file.setFileUrl(azureBlobService.upload(blob, blob.getName()));
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
        file.setVisible(false);
        return fileRepos.save(file);
    }

    @Override
    public Page<File> getAll(Pageable pageable, String filter, String search, boolean includeInvisible) {
        var spec = OpenApiHelper.<File>filterToSpec(filter);
        spec = spec.and(OpenApiHelper.searchToSpec(search));
        if (!includeInvisible) {
            spec = spec.and((a, _, cb) -> cb.isTrue(a.get("isVisible")));
        }
        return fileRepos.findAll(spec, pageable);
    }
}