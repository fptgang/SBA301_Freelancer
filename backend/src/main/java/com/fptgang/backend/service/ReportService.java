package com.fptgang.backend.service;

import com.fptgang.backend.model.Report;
import com.fptgang.backend.service.params.ListParams;
import org.springframework.data.domain.Page;

public interface ReportService {
    Report create(Report report);
    Report update(Report report);
    Report findById(long id);
    Page<Report> getAll(ListParams params);
}
