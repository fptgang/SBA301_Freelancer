package com.fptgang.backend.service.impl;

import com.fptgang.backend.api.model.SolutionDto;
import com.fptgang.backend.model.*;
import com.fptgang.backend.repository.ReportRepos;
import com.fptgang.backend.service.ProjectService;
import com.fptgang.backend.service.ReportService;
import com.fptgang.backend.service.TransactionService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.EntityUtil;
import com.fptgang.backend.util.OpenApiHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class ReportServiceImpl implements ReportService {

    @Autowired
    private ReportRepos reportRepos;
    @Autowired
    private ProjectService projectService;
    @Autowired
    private TransactionService transactionService;


    @Override
    public Report create(Report report) {
        if (report.getProject().getStatus() != Project.ProjectStatus.IN_PROGRESS) {
            throw new IllegalArgumentException("Project must be in progress to create a report");
        }
        List<Report> unsolvedReports = reportRepos.findAllByProject_ProjectIdAndAndStatusNot(report.getProject().getProjectId(), Report.ReportStatus.SOLVED);
        if (unsolvedReports != null && !unsolvedReports.isEmpty()) {
            throw new IllegalArgumentException("There is already an unsolved report for this project");
        }
        report.setReportId(null);
        report.setSolution(null);
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
        var spec = OpenApiHelper.groupBy(params.<Report>toSpec(), "reportId");
        return reportRepos.findAll(spec, params.getPageable());
    }

    @Override
    public Report resolve(long reportId, SolutionDto solution) {
        Report report = reportRepos.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("Report does not exist"));
        if (solution.getStaffId() != null &&
                !solution.getStaffId().equals(report.getProject().getStaff().getAccountId())) {
            throw new IllegalArgumentException("Only staff assigned to the project can resolve the report");
        }
        Project project = report.getProject();
        if (solution.getProjectStatus() == SolutionDto.ProjectStatusEnum.TERMINATE) {
            projectService.terminateByStaff(project.getProjectId(), Role.valueOf(solution.getTransferDepositTo().name()));
        } else {
            if (SolutionDto.TransferDepositToEnum.CLIENT == solution.getTransferDepositTo()) {
                // Refund client
                log.info("Refunding client for project {}", project.getProjectId());
                project.getMilestones().forEach(milestone -> {
                    if (milestone.getStatus() != Milestone.MilestoneStatus.FINISHED &&
                            milestone.getStatus() != Milestone.MilestoneStatus.TERMINATED
                    && milestone.getFundStatus() == Milestone.FundStatus.DEPOSITED) {
                        Transaction refundTransaction = transactionService.createEscrowRefund(milestone);
                        if (refundTransaction.getStatus() == Transaction.TransactionStatus.SUCCESS) {
                            log.info("Refunded client for milestone {}", milestone.getMilestoneId());
                            milestone.setFundStatus(Milestone.FundStatus.REFUNDED);
                        }
                    }
                });
            } else if (SolutionDto.TransferDepositToEnum.FREELANCER == solution.getTransferDepositTo()) {
                log.info("Release deposit  for freelancer {}", project.getProjectId());
                project.getMilestones().forEach(milestone -> {
                    if (milestone.getStatus() == Milestone.MilestoneStatus.IN_PROGRESS) {
                        Transaction refundTransaction = transactionService.createEscrowRelease(milestone);
                        if (refundTransaction.getStatus() == Transaction.TransactionStatus.SUCCESS) {
                            log.info("Refunded freelancer for milestone {}", milestone.getMilestoneId());
                            milestone.setFundStatus(Milestone.FundStatus.RELEASED);
                        }
                    }
                });
            }
        }
        report.setSolution(solution.getSolution());
        report.setStatus(Report.ReportStatus.SOLVED);
        log.info("Resolved report {}", report.getReportId());
        return reportRepos.save(report);
    }
}
