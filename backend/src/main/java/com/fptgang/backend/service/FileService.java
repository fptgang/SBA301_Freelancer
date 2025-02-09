package com.fptgang.backend.service;

import com.fptgang.backend.model.File;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface FileService {
    File create(File file, MultipartFile blob);
    File update(File file, MultipartFile blob);
    File findById(long id);
    File deleteById(long id);
    Page<File> getAll(Pageable pageable, String filter, String search, boolean includeInvisible);
    default Page<File> getAll(Pageable pageable, String filter, String search) {
        return getAll(pageable, filter, search, false);
    }
    default Page<File> getAll(Pageable pageable, String filter) {
        return getAll(pageable, filter, null, false);
    }
}
