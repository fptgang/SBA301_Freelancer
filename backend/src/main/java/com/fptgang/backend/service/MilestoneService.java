package com.fptgang.backend.service;

import com.fptgang.backend.model.Milestone;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MilestoneService {
    Milestone update(Milestone milestone);
    Milestone findById(long id);
    Milestone deleteById(long id);
    Page<Milestone> getAll(Pageable pageable, String filter);
}
