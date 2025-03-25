package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.ProposalsApi;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.api.model.ProposalDto;
import com.fptgang.backend.mapper.DetailLevel;
import com.fptgang.backend.mapper.ProposalCreateMapper;
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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@Slf4j
public class ProposalController implements ProposalsApi {
    private final ProposalService proposalService;
    private final ProposalMapper proposalMapper;
    private final ProposalCreateMapper proposalCreateMapper;

    @Autowired
    public ProposalController(ProposalService proposalService,
                              ProposalMapper proposalMapper,
                              ProposalCreateMapper proposalCreateMapper) {
        this.proposalService = proposalService;
        this.proposalMapper = proposalMapper;
        this.proposalCreateMapper = proposalCreateMapper;
    }

    @Override
    public ResponseEntity<GetProposals200Response> getProposals(Pageable pageable, String filter, String search) {
        if (SecurityUtil.isGuest()) {
            throw new AccessDeniedException("No access");
        }

        var page = OpenApiHelper.toPageable(pageable);
        var params = ListParams.builder()
                .pageable(page)
                .search(search)
                .filter(filter);

        // Freelancer can only access his proposals
        if (SecurityUtil.requireCurrentUserRole() == Role.FREELANCER) {
            params.setFilter("freelancer.accountId", "eq", SecurityUtil.requireCurrentUserId());
        }

        // Client can view all proposals only if they belong to their own projects
        if (SecurityUtil.requireCurrentUserRole() == Role.CLIENT) {
            params.setFilter("project.client.accountId", "eq", SecurityUtil.requireCurrentUserId());
        }

        var res = proposalService
                .getAll(params.build())
                .map(proposal -> proposalMapper.toDTO(proposal, DetailLevel.SUMMARY));
        return OpenApiHelper.respondPage(res, GetProposals200Response.class);
    }

    @Override
    public ResponseEntity<ProposalDto> getProposalById(Long proposalId) {
        var res = proposalService.findById(proposalId);
        if(SecurityUtil.hasRole(Role.STAFF, Role.ADMIN)) {
            return new ResponseEntity<>(proposalMapper.toDTO(res, DetailLevel.FULL), HttpStatus.OK);
        }
        if(!res.getFreelancer().getAccountId().equals(SecurityUtil.requireCurrentUserId())) {
            if(res.getProject().getClient().getAccountId().equals(SecurityUtil.requireCurrentUserId())) {
                return new ResponseEntity<>(proposalMapper.toDTO(res, DetailLevel.FULL), HttpStatus.OK);
            }
            else throw new AccessDeniedException("You do not have permission to access this resource");
        }
        return new ResponseEntity<>(proposalMapper.toDTO(res, DetailLevel.FULL), HttpStatus.OK);
    }

    /**
     * Can access: Authenticated users
     */
    @Override
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProposalDto> createProposal(ProposalCreateDto proposalCreateDto) {
        if(!SecurityUtil.hasRole(Role.FREELANCER)){
            throw new AccessDeniedException("Non-freelancer cannot create proposal");
        }
        return new ResponseEntity<>(
                proposalMapper.toDTO(
                    proposalService.create(proposalCreateMapper.toEntity(proposalCreateDto)),
                    DetailLevel.FULL
                ),
                HttpStatus.CREATED
        );
    }

    /**
     * Can access: Client of the project
     */
    @Override
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProposalDto> rejectProposal(Long proposalId) {
        return new ResponseEntity<>(
                proposalMapper.toDTO(
                    proposalService.rejectProposal(proposalId),
                    DetailLevel.FULL
                ),
                HttpStatus.OK
        );
    }

    /**
     * Can access: Freelancer owns his proposal
     */
    @Override
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProposalDto> withdrawProposal(Long proposalId) {
        return new ResponseEntity<>(
                proposalMapper.toDTO(
                    proposalService.withdrawProposal(proposalId),
                    DetailLevel.FULL
                ),
                HttpStatus.OK
        );
    }
}
