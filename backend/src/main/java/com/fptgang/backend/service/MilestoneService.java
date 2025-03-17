package com.fptgang.backend.service;

import com.fptgang.backend.model.Milestone;
import com.fptgang.backend.service.params.ListParams;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MilestoneService {
    Milestone create(Milestone milestone);
    Milestone update(Milestone milestone);
    Milestone findById(long id);
    Milestone deleteById(long id);
    Milestone depositFund(Milestone milestone);
    Milestone releaseFund(Milestone milestone);
    Milestone returnFund(Milestone milestone);
    Page<Milestone> getAll(ListParams params);
    Milestone submitWork(Milestone milestone, List<MultipartFile> blobs);
    Milestone confirmWork(Milestone milestone);
}
