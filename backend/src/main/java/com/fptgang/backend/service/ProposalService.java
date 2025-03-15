package com.fptgang.backend.service;

import com.fptgang.backend.model.Proposal;
import com.fptgang.backend.service.params.ListParams;
import org.springframework.data.domain.Page;
import org.springframework.lang.Nullable;

public interface ProposalService {
    Proposal create(Proposal proposal);
    Proposal findById(long id);
    Page<Proposal> getAll(ListParams params);
    Proposal acceptProposal(long proposalId);
    Proposal rejectProposal(long proposalId);
    Proposal withdrawProposal(long proposalId);
    long countByProjectIdAndStatus(long projectId, @Nullable Proposal.ProposalStatus status);
}
