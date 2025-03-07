package com.fptgang.backend.service;

import com.fptgang.backend.model.Proposal;
import com.fptgang.backend.service.params.ListParams;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProposalService {
    Proposal create(Proposal proposal);
    Proposal update(Proposal proposal);
    Proposal findById(long id);
    Page<Proposal> getAll(ListParams params);
}
