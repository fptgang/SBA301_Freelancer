package com.fptgang.backend.service.impl;

import com.fptgang.backend.api.model.SolutionDto;
import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.*;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.MilestoneRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.repository.ReportRepos;
import com.fptgang.backend.security.AuthContext;
import com.fptgang.backend.service.*;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.EntityUtil;
import com.fptgang.backend.util.OpenApiHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.io.IOException;
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
    private final MilestoneService milestoneService;
    private final MilestoneRepos milestoneRepos;
    private final EmailService emailService;

    public ReportServiceImpl(ReportRepos reportRepos,
                             ProjectService projectService,
                             TransactionService transactionService,
                             AuthContext authContext,
                             ProjectRepos projectRepos,
                             AccountRepos accountRepos, MilestoneService milestoneService, MilestoneRepos milestoneRepos, EmailService emailService) {
        this.reportRepos = reportRepos;
        this.projectService = projectService;
        this.transactionService = transactionService;
        this.authContext = authContext;
        this.projectRepos = projectRepos;
        this.accountRepos = accountRepos;
        this.milestoneService = milestoneService;
        this.milestoneRepos = milestoneRepos;
        this.emailService = emailService;
    }

    @Override
    public Report create(Report report) {
        Project project = projectRepos.findByProjectId(report.getProject().getProjectId())
                .orElseThrow(() -> new InvalidInputException("Unknown project"));
        if (!project.getIsVisible())
            throw new IllegalStateException("Project was deleted");
        if (project.getStatus() != Project.ProjectStatus.IN_PROGRESS)
            throw new IllegalStateException("Project must be in progress to create a report");

        if (!authContext.hasInternalAccess(project)) {
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
        try {
            emailService.sendReportEmailTemplateToBoth(report);
        } catch (IOException ignored) {

        }
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
        try {
            emailService.sendReportEmailTemplateToBoth(existing);
        } catch (IOException ignored) {

        }
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
                // Refund client for a first milestone not in completed state
                log.info("Refunding client for project {}", project.getProjectId());
                Milestone milestone = project.getActiveMilestone();
                if (milestone.getStatus() != Milestone.MilestoneStatus.TERMINATED
                        && milestone.getStatus() != Milestone.MilestoneStatus.FINISHED
                        && milestone.getFundStatus() == Milestone.FundStatus.DEPOSITED) {
                    Transaction refundTransaction = transactionService.createEscrowRefund(milestone);
                    if (refundTransaction.getStatus() == Transaction.TransactionStatus.SUCCESS) {
                        log.info("Refunded client for milestone {}", milestone.getMilestoneId());
                        finishMilestone(milestone);
                    }
                }
            } else if (SolutionDto.TransferDepositToEnum.FREELANCER == solution.getTransferDepositTo()) {
                // Refund freelancer for a first milestone not in completed state
                log.info("Release deposit  for freelancer {}", project.getProjectId());
                Milestone milestone = project.getActiveMilestone();
                if (milestone.getStatus() != Milestone.MilestoneStatus.TERMINATED
                        && milestone.getStatus() != Milestone.MilestoneStatus.FINISHED
                        && milestone.getFundStatus() == Milestone.FundStatus.DEPOSITED) {
                    Transaction refundTransaction = transactionService.createEscrowRelease(milestone);
                    if (refundTransaction.getStatus() == Transaction.TransactionStatus.SUCCESS) {
                        log.info("Refunded freelancer for milestone {}", milestone.getMilestoneId());
                        finishMilestone(milestone);
                    }
                }
                ;
            }
        }
        report.setSolution(solution.getSolution());
        report.setStatus(Report.ReportStatus.SOLVED);
        log.info("Resolved report {}", report.getReportId());
        try {
            emailService.sendReportEmailTemplateToBoth(report);
        } catch (IOException ignored) {

        }
        return reportRepos.save(report);
    }

    private void finishMilestone(Milestone milestone) {
        milestone.setStatus(Milestone.MilestoneStatus.FINISHED);
        milestone = milestoneRepos.save(milestone);
        log.info("Milestone {} finished", milestone.getMilestoneId());

        // *** If no more milestones, finish project
        Milestone nextMilestone = milestone.getNextVisibleMilestone();
        if (nextMilestone == null) {
            milestone.getProject().setStatus(Project.ProjectStatus.FINISHED);
            milestone.getProject().setActiveMilestone(null);
            milestone.setProject(projectRepos.save(milestone.getProject()));
            log.info("Project {} finished", milestone.getProject().getProjectId());
            return;
        }

        // *** Otherwise, start next milestone
        if (nextMilestone.getFundStatus() == Milestone.FundStatus.NONE) {
            if (nextMilestone.getProject().getClient().getBalance().compareTo(nextMilestone.getContractualBudget()) < 0) {
                throw new IllegalStateException("Not enough balance to fund the next milestone");
            }
            nextMilestone = milestoneService.depositFund(nextMilestone);
        }

        nextMilestone.setStatus(Milestone.MilestoneStatus.IN_PROGRESS);
        nextMilestone = milestoneRepos.save(nextMilestone);
        nextMilestone.getProject().setActiveMilestone(nextMilestone);
        nextMilestone.setProject(projectRepos.save(nextMilestone.getProject()));
        log.info("Milestone {} started", nextMilestone.getMilestoneId());
    }
}
