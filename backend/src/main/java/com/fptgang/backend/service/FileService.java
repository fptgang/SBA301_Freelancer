package com.fptgang.backend.service;

import com.fptgang.backend.model.File;
import com.fptgang.backend.service.params.ListParams;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface FileService {
    File create(File file, MultipartFile blob);
    File update(File file, MultipartFile blob);
    File findById(long id);
    File deleteById(long id);
    Page<File> getAll(ListParams params);
}
