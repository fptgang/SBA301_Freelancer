package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.FileDto;
import com.fptgang.model.File;


public class FileMapper extends BaseMapper<FileDto, File> {

    @Override
    FileDto toDTO(File entity) {
        if (entity == null) {
            return null;
        }
        FileDto dto = new FileDto();
        dto.setFileId(entity.getFileId());
        dto.setFileName(entity.getFileName());
        dto.setFileType(entity.getFileType());
        dto.setFileUrl(entity.getFileUrl());
        dto.setSize(dto.getSize());
        dto.setCreatedAt(dto.getCreatedAt());

        return dto;
    }

    @Override
    File toEntity(FileDto dto) {

        if (dto == null) {
            return null;
        }

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
            file.setCreatedAt(dto.getCreatedAt());
        }

        return file;
    }


}
