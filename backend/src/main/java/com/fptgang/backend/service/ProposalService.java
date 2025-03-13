package com.fptgang.backend.service;

import com.fptgang.backend.model.Proposal;
import com.fptgang.backend.service.params.ListParams;
import org.springframework.data.domain.Page;

public interface ProposalService {
    Proposal create(Proposal proposal);
    Proposal update(Proposal proposal);
    Proposal findById(long id);
    Page<Proposal> getAll(ListParams params);
    Proposal acceptProposal(long proposalId, long currentUserId);
    Proposal rejectProposal(long proposalId, long currentUserId);
    Proposal withdrawProposal(long proposalId, long currentUserId);
}
