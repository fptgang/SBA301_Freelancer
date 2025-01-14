package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.FileDto;
import com.fptgang.backend.repository.FileRepos;
import com.fptgang.backend.model.File;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

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
        dto.setSize(entity.getSize());
        dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));
        dto.setIsVisible(entity.isVisible());

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

            // NOTE: can only change visibility
            //existFile.setFileName(dto.getFileName() != null ? dto.getFileName(): existFile.getFileName());
            //existFile.setFileType(dto.getFileType() != null ? dto.getFileType(): existFile.getFileType());
            //existFile.setFileUrl(dto.getFileUrl() != null ? dto.getFileUrl(): existFile.getFileUrl());
            //existFile.setSize(dto.getSize() != null ? dto.getSize() : existFile.getSize());
            existFile.setVisible(dto.getIsVisible() != null ? dto.getIsVisible() : existFile.isVisible());

            return existFile;
        }
        else{
            File file = new File();
            file.setFileId(dto.getFileId());

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
                file.setSize(dto.getSize());
            }

            if (dto.getIsVisible() != null) {
                file.setVisible(dto.getIsVisible());
            }

            return file;
        }

    }


}
