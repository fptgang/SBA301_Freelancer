package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.ContractsApi;
import com.fptgang.backend.api.model.ContractDto;
import com.fptgang.backend.api.model.GetContracts200Response;
import com.fptgang.backend.api.model.Pageable;
import com.fptgang.backend.mapper.ContractMapper;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.service.ContractService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.OpenApiHelper;
import com.fptgang.backend.util.SecurityUtil;
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
    public ResponseEntity<ContractDto> createContract(ContractDto contractDto) {
        var contract = contractMapper.toEntity(contractDto);
        return new ResponseEntity<>(contractMapper.toDTO(contractService.create(contract)), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Void> deleteContract(Long contractId) {
        contractService.deleteById(contractId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<ContractDto> getContractById(Long contractId) {
        return new ResponseEntity<>(contractMapper.toDTO(contractService.findById(contractId)), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<GetContracts200Response> getContracts(Pageable pageable, String filter, String search) {

        var includeInvisible = SecurityUtil.hasPermission(Role.ADMIN);
        var params = ListParams.builder()
                .pageable(OpenApiHelper.toPageable(pageable))
                .search(search)
                .filter(filter)
                .includeInvisible(includeInvisible);
        var res = contractService
                .getAll(params.build())
                .map(contractMapper::toDTO);
        return OpenApiHelper.respondPage(res, GetContracts200Response.class);
    }

}
