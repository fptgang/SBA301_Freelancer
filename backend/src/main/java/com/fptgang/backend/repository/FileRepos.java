package com.fptgang.backend.repository;

import com.fptgang.model.File;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FileRepos extends JpaRepository<File,Long> {
    Optional<File> findByFileId(Long fileId);
}
