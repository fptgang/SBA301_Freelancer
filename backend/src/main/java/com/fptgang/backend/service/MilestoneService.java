package com.fptgang.backend.service;

import com.fptgang.backend.model.Milestone;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MilestoneService {
    Milestone create(Milestone milestone);
    Milestone update(Milestone milestone);
    Milestone findById(long id);
    Milestone deleteById(long id);
    Page<Milestone> getAll(Pageable pageable, String filter, String search, boolean includeInvisible);
    default Page<Milestone> getAll(Pageable pageable, String filter, String search) {
        return getAll(pageable, filter, search, false);
    }
    default Page<Milestone> getAll(Pageable pageable, String filter) {
        return getAll(pageable, filter, null, false);
    }
}
