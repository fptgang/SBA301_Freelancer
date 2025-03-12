package com.fptgang.backend.repository;

import com.fptgang.backend.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface ReportRepos extends JpaRepository<Report,Long>, JpaSpecificationExecutor<Report> {
    Optional<Report> findByReportId(Long reportId);
    List<Report> findAllByProject_ProjectIdAndAndStatusNot(Long projectId, Report.ReportStatus status);
}
