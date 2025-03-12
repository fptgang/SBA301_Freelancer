package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ProposalDto;
import com.fptgang.backend.api.model.ProposalStatusDto;
import com.fptgang.backend.model.Proposal;
import com.fptgang.backend.model.Proposal.ProposalStatus;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.FileRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.util.DateTimeUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ProposalMapper extends BaseMapper<ProposalDto, Proposal> {
    private final ProjectRepos projectRepos;
    private final AccountRepos accountRepos;
    private final AccountMapper accountMapper;
    private final ContractMapper.Converter contractConverter;
    private final FileRepos fileRepos;
    private final FileMapper fileMapper;

    public ProposalMapper(ProjectRepos projectRepos,
                          AccountRepos accountRepos,
                          AccountMapper accountMapper,
                          ContractMapper.Converter contractConverter,
                          FileRepos fileRepos,
                          FileMapper fileMapper) {
        this.projectRepos = projectRepos;
        this.accountRepos = accountRepos;
        this.accountMapper = accountMapper;
        this.contractConverter = contractConverter;
        this.fileRepos = fileRepos;
        this.fileMapper = fileMapper;
    }

    @Override
    public Proposal toEntity(ProposalDto dto) {
        if (dto == null) {
            return null;
        }

        Proposal entity = new Proposal();
        entity.setProposalId(dto.getProposalId());
        if (dto.getProjectId() != null) {
            entity.setProject(projectRepos.getReferenceById(dto.getProjectId()));
        }
        if (dto.getFreelancer() != null && dto.getFreelancer().getAccountId() != null) {
            entity.setFreelancer(accountRepos.getReferenceById(dto.getFreelancer().getAccountId()));
        }
        entity.setNotes(dto.getNotes());
        entity.setBudget(dto.getBudget());
        entity.setStatus(dto.getStatus() == null ? null : ProposalStatus.valueOf(dto.getStatus().name()));
        entity.setContract(contractConverter.toEntity(dto.getContract()));
        entity.setCreatedAt(DateTimeUtil.fromOffsetToLocal(dto.getCreatedAt()));
        entity.setUpdatedAt(DateTimeUtil.fromOffsetToLocal(dto.getUpdatedAt()));
        entity.setFiles(dto.getFiles() == null ? null : dto.getFiles().stream()
                .filter(e -> e.getFileId() != null)
                .map(e -> fileRepos.getReferenceById(e.getFileId()))
                .toList());

        return entity;
    }

    @Override
    public ProposalDto toDTO(Proposal entity, DetailLevel level) {
        if (entity == null) {
            return null;
        }

        ProposalDto dto = new ProposalDto();
        dto.setProposalId(entity.getProposalId());
        dto.setProjectId(entity.getProject().getProjectId());
        dto.setFreelancer(accountMapper.toDTO(entity.getFreelancer(), DetailLevel.REFERENCE));
        dto.setNotes(entity.getNotes());
        dto.setBudget(entity.getBudget());
        dto.setStatus(ProposalStatusDto.valueOf(entity.getStatus().name()));
        dto.setContract(contractConverter.toDTO(entity.getContract(), DetailLevel.FULL));
        dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));
        dto.setUpdatedAt(DateTimeUtil.fromLocalToOffset(entity.getUpdatedAt()));
        dto.setFiles(entity.getFiles().stream().map((file -> fileMapper.toDTO(file, DetailLevel.FULL))).toList());
        return dto;
    }
}