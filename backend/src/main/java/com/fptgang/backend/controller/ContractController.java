package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.ContractsApi;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.mapper.ContractMapper;
import com.fptgang.backend.mapper.DetailLevel;
import com.fptgang.backend.model.Proposal;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.service.ContractService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.OpenApiHelper;
import com.fptgang.backend.util.SecurityUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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


    /**
     * Can access: Freelancer of the contract
     */
    @Override
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ContractDto> signContract(Long contractId) {
        return new ResponseEntity<>(contractMapper.toDTO(contractService.signContract(contractId), DetailLevel.FULL), HttpStatus.OK);
    }

    /**
     * Can access: Client
     */
    @Override
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ContractDto> createContract(Long proposalId) {
        return new ResponseEntity<>(contractMapper.toDTO(contractService.create(proposalId), DetailLevel.FULL), HttpStatus.OK);
    }

    @Override
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GetAllContracts200Response> getAllContracts(Pageable pageable, String filter, String search) {
        log.info("Getting contracts");
        var params = ListParams.builder()
                .pageable(OpenApiHelper.toPageable(pageable))
                .search(search)
                .filter(filter);
        // Staff cannot view Admin
        if (!SecurityUtil.hasRole(Role.STAFF)&& !SecurityUtil.hasRole(Role.ADMIN)) {
            params.setFilter("freelancer.accountId", "eq", SecurityUtil.requireCurrentUserId());
        }
        var res = contractService
                .getAll(params.build())
                .map((c) -> contractMapper.toDTO(c, DetailLevel.SUMMARY));
        return OpenApiHelper.respondPage(res, GetAllContracts200Response.class);
    }

    @Override
    public ResponseEntity<ContractDto> getContractById(Long contractId) {
        var res = contractService.findById(contractId);
        if(SecurityUtil.hasRole(Role.STAFF, Role.ADMIN)) {
            return new ResponseEntity<>(contractMapper.toDTO(res, DetailLevel.FULL), HttpStatus.OK);
        }
        if(res.getFreelancer().getAccountId().equals(SecurityUtil.requireCurrentUserId())
        || res.getProject().getClient().getAccountId().equals(SecurityUtil.requireCurrentUserId())) {
            return new ResponseEntity<>(contractMapper.toDTO(res, DetailLevel.FULL), HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.FORBIDDEN);
    }
}
