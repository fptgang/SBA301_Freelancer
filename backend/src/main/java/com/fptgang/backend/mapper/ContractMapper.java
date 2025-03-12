package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ContractDto;
import com.fptgang.backend.api.model.ContractStatusDto;
import com.fptgang.backend.model.Contract;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.FileRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.repository.ProposalRepos;
import com.fptgang.backend.util.DateTimeUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ContractMapper extends BaseMapper<ContractDto, Contract> {
    private final ProposalMapper proposalMapper;
    private final ProposalRepos proposalRepos;
    private final ContractMapper.Converter delegate;

    public ContractMapper(ProposalMapper proposalMapper,
                          ProposalRepos proposalRepos,
                          Converter delegate) {
        this.proposalMapper = proposalMapper;
        this.proposalRepos = proposalRepos;
        this.delegate = delegate;
    }

    @Override
    public Contract toEntity(ContractDto dto) {
        Contract entity = delegate.toEntity(dto);

        if (dto.getProposal() != null && dto.getProposal().getProposalId() != null) {
            entity.setProposal(proposalRepos.getReferenceById(dto.getProposal().getProposalId()));
        }

        return entity;
    }

    @Override
    public ContractDto toDTO(Contract entity, DetailLevel level) {
        ContractDto dto = delegate.toDTO(entity, level);

        if (dto != null) {
            dto.setProposal(proposalMapper.toDTO(entity.getProposal(), DetailLevel.FULL));
        }

        return dto;
    }

    @Component
    public static class Converter extends BaseMapper<ContractDto, Contract> {
        private final AccountMapper accountMapper;
        private final AccountRepos accountRepos;
        private final ProjectRepos projectRepos;
        private final FileMapper fileMapper;
        private final FileRepos fileRepos;

        public Converter(AccountMapper accountMapper,
                         AccountRepos accountRepos,
                         ProjectRepos projectRepos,
                         FileMapper fileMapper,
                         FileRepos fileRepos) {
            this.accountMapper = accountMapper;
            this.accountRepos = accountRepos;
            this.projectRepos = projectRepos;
            this.fileMapper = fileMapper;
            this.fileRepos = fileRepos;
        }

        @Override
        public Contract toEntity(ContractDto dto) {
            if (dto == null) {
                return null;
            }

            Contract entity = new Contract();
            entity.setContractId(dto.getContractId());
            if (dto.getFreelancer() != null && dto.getFreelancer().getAccountId() != null) {
                entity.setFreelancer(accountRepos.getReferenceById(dto.getFreelancer().getAccountId()));
            }
            if (dto.getProjectId() != null) {
                entity.setProject(projectRepos.getReferenceById(dto.getProjectId()));
            }
            entity.setBudget(dto.getBudget());
            entity.setSignedAt(DateTimeUtil.fromOffsetToLocal(dto.getSignedAt()));
            entity.setTerminatedAt(DateTimeUtil.fromOffsetToLocal(dto.getTerminatedAt()));
            if (dto.getStatus() != null) {
                entity.setStatus(Contract.ContractStatus.valueOf(dto.getStatus().name()));
            }
            if (dto.getContractFile() != null && dto.getContractFile().getFileId() != null) {
                entity.setContractFile(fileRepos.getReferenceById(dto.getContractFile().getFileId()));
            }
            entity.setCreatedAt(DateTimeUtil.fromOffsetToLocal(dto.getCreatedAt()));
            entity.setUpdatedAt(DateTimeUtil.fromOffsetToLocal(dto.getUpdatedAt()));

            return entity;
        }

        @Override
        public ContractDto toDTO(Contract entity, DetailLevel level) {
            if (entity == null) {
                return null;
            }

            ContractDto dto = new ContractDto();
            dto.setContractId(entity.getContractId());

            if (level == DetailLevel.REFERENCE) {
                return dto; // those fields are enough
            }

            dto.setFreelancer(accountMapper.toDTO(entity.getFreelancer(), DetailLevel.REFERENCE));
            dto.setProjectId(entity.getProject().getProjectId());
            dto.setBudget(entity.getBudget());
            dto.setSignedAt(DateTimeUtil.fromLocalToOffset(entity.getSignedAt()));
            dto.setTerminatedAt(DateTimeUtil.fromLocalToOffset(entity.getTerminatedAt()));
            dto.setStatus(ContractStatusDto.valueOf(entity.getStatus().name()));
            if (entity.getContractFile() != null) {
                dto.setContractFile(fileMapper.toDTO(entity.getContractFile(), DetailLevel.FULL));
            }
            dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));
            dto.setUpdatedAt(DateTimeUtil.fromLocalToOffset(entity.getUpdatedAt()));

            return dto;
        }
    }
}