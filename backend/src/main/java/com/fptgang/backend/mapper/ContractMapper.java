package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ContractDto;
import com.fptgang.backend.model.Contract;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.repository.ContractRepos;
import com.fptgang.backend.repository.ProposalRepos;
import com.fptgang.backend.util.DateTimeUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class ContractMapper extends BaseMapper<ContractDto, Contract> {


    @Autowired
    private ContractRepos contractRepos;

    @Autowired
    private ProjectRepos projectRepos;

    @Autowired
    private AccountRepos accountRepos;
    @Autowired
    private ProposalRepos proposalRepos;

    @Override
    public ContractDto toDTO(Contract entity) {
        if (entity == null) {
            return null;
        }

        ContractDto contractDto = new ContractDto();
        contractDto.setContractId(entity.getContractId());
        contractDto.setProjectId(entity.getProject().getProjectId());
        contractDto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));
        contractDto.setUpdatedAt(DateTimeUtil.fromLocalToOffset(entity.getUpdatedAt()));

        return contractDto;
    }

    @Override
    public Contract toEntity(ContractDto dto) {
        if (dto == null) {
            return null;
        }
        Optional<Contract> existingEntityOptional = contractRepos.findByContractId(dto.getContractId() == null ? 0 : dto.getContractId());

        if (existingEntityOptional.isPresent() && dto.getContractId() != null) {
            Contract existEntity = existingEntityOptional.get();


            return existEntity;
        }

        else{
            Contract contract = new Contract();
//            contract.setContractId(dto.getContractId());

            if (dto.getProjectId() != null) {
                contract.setProject(projectRepos.findByProjectId(dto.getProjectId())
                        .orElseThrow(() -> new IllegalArgumentException("Project not found")));
            }

            if(dto.getProposalId() != null) {
                contract.setProposal(proposalRepos.findByProposalId(dto.getProposalId())
                        .orElseThrow(() -> new IllegalArgumentException("Proposal not found")));
            }

            return contract;
        }
    }

}
