package com.fptgang.backend.service.impl;

import com.fptgang.backend.model.Report;
import com.fptgang.backend.repository.ReportRepos;
import com.fptgang.backend.service.ReportService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.EntityUtil;
import com.fptgang.backend.util.OpenApiHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportServiceImpl implements ReportService {

    @Autowired
    private ReportRepos reportRepos;


    @Override
    public Report create(Report report) {
        List<Report> unsolvedReports = reportRepos.findAllByProject_ProjectIdAndAndStatusNot(report.getProject().getProjectId(), Report.ReportStatus.SOLVED);
        if(unsolvedReports != null && unsolvedReports.size() > 0){
            throw new IllegalArgumentException("There is already an unsolved report for this project");
        }
        report.setReportId(null);
        report.setStatus(Report.ReportStatus.UNSOLVED);
        return reportRepos.save(report);
    }

    @Override
    public Report update(Report report) {
        if (report.getReportId() == null) {
            throw new IllegalArgumentException("Report does not exist");
        }
        Report existing = reportRepos.findById(report.getReportId())
                .orElseThrow(() -> new IllegalArgumentException("Report does not exist"));
        EntityUtil.merge(existing, report);
        return reportRepos.save(report);
    }

    @Override
    public Report findById(long id) {
        return reportRepos.findById(id).orElseThrow(
                () -> new IllegalArgumentException("Report does not exist")
        );
    }

    @Override
    public Page<Report> getAll(ListParams params) {
        var spec = OpenApiHelper.groupBy( params.<Report>toSpec(), "reportId");
        return reportRepos.findAll(spec, params.getPageable());
    }
}
