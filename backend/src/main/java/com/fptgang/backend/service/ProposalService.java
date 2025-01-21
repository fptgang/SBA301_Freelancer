package com.fptgang.backend.service;

import com.fptgang.backend.model.Proposal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProposalService {
    Proposal create(Proposal proposal);
    Proposal update(Proposal proposal);
    Proposal findById(long id);
    Proposal deleteById(long id);
    Page<Proposal> getAll(Pageable pageable, String filter, String search, boolean includeInvisible);
    default Page<Proposal> getAll(Pageable pageable, String filter, String search) {
        return getAll(pageable, filter, search, false);
    }
    default Page<Proposal> getAll(Pageable pageable, String filter) {
        return getAll(pageable, filter, null, false);
    }
}
