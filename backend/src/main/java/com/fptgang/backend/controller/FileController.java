package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.FilesApi;
import com.fptgang.backend.api.model.FileDto;
import com.fptgang.backend.mapper.DetailLevel;
import com.fptgang.backend.mapper.FileMapper;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.File;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.service.FileService;
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
    public FileController(FileService fileService,
                          FileMapper fileMapper
    ) {
        this.fileService = fileService;
        this.fileMapper = fileMapper;
    }

    /**
     * Can access: Who can access related entity
     */
    @Override
    public ResponseEntity<FileDto> uploadFile(MultipartFile blob,
                                              Long messageId,
                                              Long proposalId,
                                              Long projectId,
                                              Long milestoneId,
                                              Long contractId
    ) {
        File file;
        if (messageId != null)
            file = fileService.createForMessage(messageId, blob);
        else if (proposalId != null)
            file = fileService.createForProposal(proposalId, blob);
        else if (projectId != null)
            file = fileService.createForProject(projectId, blob);
        else if (milestoneId != null)
            file = fileService.createForMilestone(milestoneId, blob);
        else if (contractId != null)
            file = fileService.createForContract(contractId, blob);
        else
            throw new IllegalArgumentException("Unknown target");
        return new ResponseEntity<>(fileMapper.toDTO(file, DetailLevel.FULL), HttpStatus.OK);
    }

    /**
     * Can access: Who can access related entity
     */
    @Override
    public ResponseEntity<Void> deleteFile(Long fileId) {
        fileService.deleteById(fileId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
