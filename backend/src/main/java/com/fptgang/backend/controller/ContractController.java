package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.ContractsApi;
import com.fptgang.backend.api.model.ContractDto;
import com.fptgang.backend.api.model.ProposalDto;
import com.fptgang.backend.mapper.ContractMapper;
import com.fptgang.backend.mapper.DetailLevel;
import com.fptgang.backend.model.Proposal;
import com.fptgang.backend.service.ContractService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@Slf4j
public class ContractController implements ContractsApi {
    private final ContractService contractService;
    private final ContractMapper contractMapper;

    @Autowired
    public ContractController(ContractService contractService, ContractMapper contractMapper) {
        this.contractService = contractService;
        this.contractMapper = contractMapper;
    }

    @Override
    public ResponseEntity<ContractDto> signContract(Long contractId) {
        return new ResponseEntity<>(contractMapper.toDTO(contractService.signContract(contractId), DetailLevel.FULL), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<ContractDto> createContract(Long proposalId) {
        ContractDto contractDto = new ContractDto();
        ProposalDto proposalDto = new ProposalDto();
        proposalDto.setProposalId(proposalId);
        contractDto.setProposal(proposalDto);
        return new ResponseEntity<>(contractMapper.toDTO(contractService.create(contractMapper.toEntity(contractDto)), DetailLevel.FULL), HttpStatus.OK);
    }
}
