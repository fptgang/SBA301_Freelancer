package com.fptgang.backend.service;

import com.fptgang.backend.model.File;
import org.springframework.web.multipart.MultipartFile;

public interface FileService {
    /**
     * Upload file to storage
     * @param accountId the account id
     * @param fileName the file name
     * @param fileContent the file content
     * @param object the bound object only type of Project, Proposal, Message are allowed
     * @return the file url
     */

    File uploadFile(long accountId, String fileName, byte[] fileContent,Object object);


    void deleteFile(long accountId, String fileName);

    void deleteAllFiles(long accountId);
}
