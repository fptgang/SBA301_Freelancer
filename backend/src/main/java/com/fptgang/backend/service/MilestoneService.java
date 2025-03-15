package com.fptgang.backend.service;

import com.fptgang.backend.model.Milestone;
import com.fptgang.backend.service.params.ListParams;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MilestoneService {
    Milestone create(Milestone milestone);
    Milestone update(Milestone milestone);
    Milestone findById(long id);
    Milestone deleteById(long id);
    Milestone depositFund(Milestone milestone);
    Milestone releaseFund(Milestone milestone);
    Milestone returnFund(Milestone milestone);
    Page<Milestone> getAll(ListParams params);
}
