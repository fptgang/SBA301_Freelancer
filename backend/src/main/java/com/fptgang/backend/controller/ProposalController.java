package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.ProposalsApi;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.api.model.ProposalDto;
import com.fptgang.backend.mapper.DetailLevel;
import com.fptgang.backend.mapper.ProposalMapper;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.service.ProposalService;
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
public class ProposalController implements ProposalsApi {
    private final ProposalService proposalService;
    private final ProposalMapper proposalMapper;

    @Autowired
    public ProposalController(ProposalService proposalService, ProposalMapper proposalMapper) {
        this.proposalService = proposalService;
        this.proposalMapper = proposalMapper;
    }

    @Override
    public ResponseEntity<GetProposals200Response> getProposals(Pageable pageable, String filter, String search) {
        var page = OpenApiHelper.toPageable(pageable);
        var includeInvisible = SecurityUtil.hasPermission(Role.ADMIN);
        var params = ListParams.builder()
                .pageable(page)
                .search(search)
                .filter(filter);
        var res = proposalService
                .getAll(params.build())
                .map(proposal -> proposalMapper.toDTO(proposal, DetailLevel.SUMMARY));
        return OpenApiHelper.respondPage(res, GetProposals200Response.class);
    }

    @Override
    public ResponseEntity<ProposalDto> createProposal(ProposalCreateDto proposalCreateDto) {
        proposalCreateDto.setFreelancerId(SecurityUtil.requireCurrentUserId());
        if(!SecurityUtil.hasRole(Role.FREELANCER)){
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        return new ResponseEntity<>(proposalMapper.toDTO(
                proposalService.create(proposalMapper.toEntity(proposalCreateDto)),
                DetailLevel.FULL),
                HttpStatus.CREATED);
    }

    @Override
    public ResponseEntity<ProposalDto> rejectProposal(Long proposalId) {
        return new ResponseEntity<>(proposalMapper.toDTO(
                proposalService.rejectProposal(proposalId, SecurityUtil.requireCurrentUserId()),
                DetailLevel.FULL),
                HttpStatus.OK);
    }

    @Override
    public ResponseEntity<ProposalDto> withdrawProposal(Long proposalId) {
        return new ResponseEntity<>(proposalMapper.toDTO(
                proposalService.withdrawProposal(proposalId, SecurityUtil.requireCurrentUserId()),
                DetailLevel.FULL),
                HttpStatus.OK);
    }
}
