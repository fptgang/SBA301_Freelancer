package com.fptgang.backend.service;

import com.fptgang.backend.model.Proposal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProposalService {
    void update(Proposal proposal);
    Proposal findById(long id);
    void deleteById(long id);
    Page<Proposal> getAll(Pageable pageable, String filter);
}
