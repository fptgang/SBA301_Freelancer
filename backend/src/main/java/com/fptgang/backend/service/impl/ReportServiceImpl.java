package com.fptgang.backend.service.impl;

import com.fptgang.backend.api.model.SolutionDto;
import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.*;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.repository.ReportRepos;
import com.fptgang.backend.security.AuthContext;
import com.fptgang.backend.service.ProjectService;
import com.fptgang.backend.service.ReportService;
import com.fptgang.backend.service.TransactionService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.EntityUtil;
import com.fptgang.backend.util.OpenApiHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class ReportServiceImpl implements ReportService {

    private final ReportRepos reportRepos;
    private final ProjectService projectService;
    private final TransactionService transactionService;
    private final AuthContext authContext;
    private final ProjectRepos projectRepos;
    private final AccountRepos accountRepos;

    public ReportServiceImpl(ReportRepos reportRepos,
                             ProjectService projectService,
                             TransactionService transactionService,
                             AuthContext authContext,
                             ProjectRepos projectRepos,
                             AccountRepos accountRepos) {
        this.reportRepos = reportRepos;
        this.projectService = projectService;
        this.transactionService = transactionService;
        this.authContext = authContext;
        this.projectRepos = projectRepos;
        this.accountRepos = accountRepos;
    }

    @Override
    public Report create(Report report) {
        Project project = projectRepos.findByProjectId(report.getProject().getProjectId())
                .orElseThrow(() -> new InvalidInputException("Unknown project"));
        if (!project.getIsVisible())
            throw new IllegalStateException("Project was deleted");
        if (project.getStatus() != Project.ProjectStatus.IN_PROGRESS)
            throw new IllegalStateException("Project must be in progress to create a report");

        if (!authContext.hasInternalAccess(project)){
            throw new AccessDeniedException("No access to this project");
        }

        List<Report> unsolvedReports = reportRepos.findAllByProject_ProjectIdAndAndStatusNot(
                project.getProjectId(), Report.ReportStatus.SOLVED);
        if (unsolvedReports != null && !unsolvedReports.isEmpty()) {
            throw new IllegalArgumentException("There is already an unsolved report for this project");
        }

        report.setReportId(null);
        report.setSolution(null);
        report.setStatus(Report.ReportStatus.UNSOLVED);
        report.setReporter(accountRepos.getReferenceById(authContext.requireAccountId()));
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
        return reportRepos.save(existing);
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
                // Refund client for a milestone in progress
                log.info("Refunding client for project {}", project.getProjectId());
                for(Milestone milestone: project.getMilestones()){
                        if (milestone.getStatus() == Milestone.MilestoneStatus.IN_PROGRESS
                                && milestone.getFundStatus() == Milestone.FundStatus.DEPOSITED) {
                            Transaction refundTransaction = transactionService.createEscrowRefund(milestone);
                            if (refundTransaction.getStatus() == Transaction.TransactionStatus.SUCCESS) {
                                log.info("Refunded client for milestone {}", milestone.getMilestoneId());
                                milestone.setFundStatus(Milestone.FundStatus.REFUNDED);
                                break;
                            }
                        }
                }
            } else if (SolutionDto.TransferDepositToEnum.FREELANCER == solution.getTransferDepositTo()) {
                // Refund freelancer for a milestone in progress
                log.info("Release deposit  for freelancer {}", project.getProjectId());
                project.getMilestones().forEach(milestone -> {
                    if (milestone.getStatus() == Milestone.MilestoneStatus.IN_PROGRESS
                            && milestone.getFundStatus() == Milestone.FundStatus.DEPOSITED) {
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
