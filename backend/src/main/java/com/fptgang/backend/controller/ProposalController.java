package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.ProposalsApi;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.api.model.ProposalDto;
import com.fptgang.backend.mapper.ProposalMapper;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.service.ProposalService;
import com.fptgang.backend.util.OpenApiHelper;
import com.fptgang.backend.util.SecurityUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/proposal")
@Slf4j
public class ProposalController implements ProposalsApi {
    private final ProposalService proposalService;
    private final ProposalMapper proposalMapper;

    @Autowired
    public ProposalController(ProposalService proposalService, ProposalMapper proposalMapper) {
        this.proposalService = proposalService;
        this.proposalMapper = proposalMapper;
    }

    @Override
    public ResponseEntity<ProposalDto> createProposal(ProposalDto proposalDto) {
        var proposal = proposalMapper.toEntity(proposalDto);
        return new ResponseEntity<>(proposalMapper.toDTO(proposalService.create(proposal)), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Void> deleteProposal(Integer proposalId) {
        proposalService.deleteById(proposalId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<ProposalDto> getProposalById(Integer proposalId) {
        return new ResponseEntity<>(proposalMapper.toDTO(proposalService.findById(proposalId)), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<GetProposals200Response> getProposals(GetAccountsPageableParameter pageable, String filter) {
        var page = OpenApiHelper.toPageable(pageable);
        Page<ProposalDto> res;
        if (Role.ADMIN.hasPermission(SecurityUtil.getCurrentUserRole())) {
            res = proposalService.getAll(page, filter).map(proposalMapper::toDTO);
        } else
            res = proposalService.getAllVisible(page, filter).map(proposalMapper::toDTO);
        return OpenApiHelper.respondPage(res, GetProposals200Response.class);
    }

    @Override
    public ResponseEntity<ProposalDto> updateProposal(Integer proposalId, ProposalDto proposalDto) {
        return new ResponseEntity<>(proposalMapper.toDTO(proposalService.update(proposalMapper.toEntity(proposalDto))), HttpStatus.OK);
    }

}
