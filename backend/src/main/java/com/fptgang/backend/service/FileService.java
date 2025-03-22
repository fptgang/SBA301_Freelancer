package com.fptgang.backend.service;

import com.fptgang.backend.model.File;
import com.fptgang.backend.service.params.ListParams;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface FileService {
    File create(MultipartFile blob);
    File createForProject(Long projectId, MultipartFile blob);
    File createForMilestone(Long milestoneId, MultipartFile blob);
    File createForProposal(Long proposalId, MultipartFile blob);
    File createForMessage(Long messageId, MultipartFile blob);
    File findById(long id);
    File deleteById(long id);
    Page<File> getAll(ListParams params);

    File createForContract(Long contractId, MultipartFile blob);
}
