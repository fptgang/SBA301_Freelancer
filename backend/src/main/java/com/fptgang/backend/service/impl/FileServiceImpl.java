package com.fptgang.backend.service.impl;

import com.fptgang.backend.model.Contract;
import com.fptgang.backend.model.File;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.repository.*;
import com.fptgang.backend.security.AuthContext;
import com.fptgang.backend.service.AzureBlobService;
import com.fptgang.backend.service.FileService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.OpenApiHelper;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@Slf4j
public class FileServiceImpl implements FileService {

    private final AzureBlobService azureBlobService;
    private final FileRepos fileRepos;
    private final AccountRepos accountRepos;
    private final ProjectRepos projectRepos;
    private final MilestoneRepos milestoneRepos;
    private final MessageRepos messageRepos;
    private final ProposalRepos proposalRepos;
    private final AuthContext authContext;
    private final ContractRepos contractRepos;

    @Autowired
    public FileServiceImpl(FileRepos fileRepos,
                           AzureBlobService azureBlobService,
                           AccountRepos accountRepos,
                           ProjectRepos projectRepos,
                           MilestoneRepos milestoneRepos,
                           MessageRepos messageRepos,
                           ProposalRepos proposalRepos,
                           AuthContext authContext, ContractRepos contractRepos) {
        this.fileRepos = fileRepos;
        this.azureBlobService = azureBlobService;
        this.accountRepos = accountRepos;
        this.projectRepos = projectRepos;
        this.milestoneRepos = milestoneRepos;
        this.messageRepos = messageRepos;
        this.authContext = authContext;
        this.proposalRepos = proposalRepos;
        this.contractRepos = contractRepos;
    }

    @Override
    @Transactional
    public File createForProject(Long projectId, MultipartFile blob) {
        return create(File.builder().project(projectRepos.getReferenceById(projectId)).build(), blob);
    }

    @Override
    @Transactional
    public File createForMilestone(Long milestoneId, MultipartFile blob) {
        return create(File.builder().milestone(milestoneRepos.getReferenceById(milestoneId)).build(), blob);
    }

    @Override
    @Transactional
    public File createForProposal(Long proposalId, MultipartFile blob) {
        return create(File.builder().proposal(proposalRepos.getReferenceById(proposalId)).build(), blob);
    }

    @Override
    @Transactional
    public File createForMessage(Long messageId, MultipartFile blob) {
        return create(File.builder().message(messageRepos.getReferenceById(messageId)).build(), blob);
    }

    @Override
    @Transactional
    public File createForContract(Long proposalId, MultipartFile blob) {
        Contract contract = contractRepos.getReferenceById(proposalId);
        File file=create(File.builder().contract(contract).build(), blob);
        contract.setContractFile(file);
        contractRepos.save(contract);
        return file;
    }

    @Override
    public long countVisibleFilesForMilestone(Long milestoneId) {
        return fileRepos.countByMilestone_MilestoneIdAndIsVisibleTrue(milestoneId);
    }

    @Override
    public File create(MultipartFile blob) {
        return create(File.builder().build(), blob);
    }

    private File create(File file, MultipartFile multipartFile) {
        file.setFileName(multipartFile.getOriginalFilename());
        if (file.getFileName() == null)
            file.setFileName(UUID.randomUUID() + ".txt");
        file.setFileType(multipartFile.getContentType() == null ? "N/A" : multipartFile.getContentType());
        file.setSize(multipartFile.getSize());
        file.setUploader(accountRepos.getReferenceById(authContext.requireAccountId()));
        file.setIsVisible(true);

        try {
            String fileUrl = azureBlobService.upload(multipartFile, file.getFileName());
            file.setFileUrl(fileUrl);
            return fileRepos.save(file);
        } catch (IOException e) {
            log.error(e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @Override
    public File findById(long id) {
        return fileRepos.findById(id).orElse(null);
    }

    @Override
    public File deleteById(long id) {
        File file = fileRepos.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("File does not exist"));

        // Only staff+ or the owner can delete
        authContext.requirePermissionOrAccountIds(Role.STAFF, file.getUploader().getAccountId());

        // Can only delete milestone file during in progress
        if (file.getMilestone() != null &&
                file.getMilestone().getProject().getStatus() != Project.ProjectStatus.IN_PROGRESS){
            throw new IllegalStateException("Milestone is not in progress");
        }

        // Can only delete project file during OPEN
        if (file.getProject() != null && file.getProject().getStatus() != Project.ProjectStatus.OPEN){
            throw new IllegalStateException("Project is not in OPEN");
        }

        // Cannot delete contract file
        if (file.getContract() != null)
            throw new IllegalStateException("Cannot delete contract supporting document");

        // Cannot delete proposal file
        if (file.getProposal() != null)
            throw new IllegalStateException("Cannot delete proposal supporting documents");

        file.setIsVisible(false);
        return fileRepos.save(file);
    }

    @Override
    public Page<File> getAll(ListParams params) {
        var spec = OpenApiHelper.groupBy( params.<File>toSpec(), "fileId");
        return fileRepos.findAll(spec, params.getPageable());
    }
}