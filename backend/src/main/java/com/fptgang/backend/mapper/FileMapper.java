package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.FileDto;
import com.fptgang.backend.repository.FileRepos;
import com.fptgang.backend.model.File;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.Optional;


@Component
public class FileMapper extends BaseMapper<FileDto, File> {

    @Autowired
    private FileRepos fileRepos;
    @Override
    public FileDto toDTO(File entity) {
        if (entity == null) {
            return null;
        }
        FileDto dto = new FileDto();
        dto.setFileId(entity.getFileId());
        dto.setFileName(entity.getFileName());
        dto.setFileType(entity.getFileType());
        dto.setFileUrl(entity.getFileUrl());
        dto.setSize(Long.valueOf(entity.getSize()));
        dto.setCreatedAt(OffsetDateTime.from(entity.getCreatedAt()));

        return dto;
    }

    @Override
    public File toEntity(FileDto dto) {

        if (dto == null) {
            return null;
        }

        Optional<File> existingFileOptional = fileRepos.findByFileId(dto.getFileId());
        if(existingFileOptional.isPresent()){
            File existFile = existingFileOptional.get();
            existFile.setFileName(dto.getFileName() != null ? dto.getFileName(): existFile.getFileName());
            existFile.setFileType(dto.getFileType() != null ? dto.getFileType(): existFile.getFileType());
            existFile.setFileUrl(dto.getFileUrl() != null ? dto.getFileUrl(): existFile.getFileUrl());
            existFile.setSize(dto.getSize() != null ? dto.getSize().intValue() : existFile.getSize());
            existFile.setCreatedAt(dto.getCreatedAt() != null ? dto.getCreatedAt().toLocalDateTime() : existFile.getCreatedAt());
            existFile.setVisible(dto.getIsVisible() != null ? dto.getIsVisible() : existFile.isVisible());

            return existFile;
        }
        else{
            File file = new File();

            if (dto.getFileId() != null) {
                file.setFileId(dto.getFileId());
            }

            if (dto.getFileName() != null) {
                file.setFileName(dto.getFileName());
            }

            if (dto.getFileUrl() != null) {
                file.setFileUrl(dto.getFileUrl());
            }

            if (dto.getFileType() != null) {
                file.setFileType(dto.getFileType());
            }

            if (dto.getSize() != null) {
                file.setSize(dto.getSize() != null ? dto.getSize().intValue() : null);
            }

            if (dto.getCreatedAt() != null) {
                file.setCreatedAt(dto.getCreatedAt().toLocalDateTime());
            }
            if (dto.getIsVisible() != null) {
                file.setVisible(dto.getIsVisible());
            }

            return file;
        }

    }


}
