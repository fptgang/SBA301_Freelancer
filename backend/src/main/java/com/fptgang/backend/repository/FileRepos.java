package com.fptgang.backend.repository;

import com.fptgang.backend.model.File;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FileRepos extends JpaRepository<File,Long>, JpaSpecificationExecutor<File> {
    Optional<File> findByFileId(Long fileId);
}
