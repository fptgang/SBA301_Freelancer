package com.fptgang.backend.service.impl;

import com.fptgang.backend.config.HirableConfig;
import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.*;
import com.fptgang.backend.repository.*;
import com.fptgang.backend.security.AuthContext;
import com.fptgang.backend.service.*;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.EntityUtil;
import com.fptgang.backend.util.OpenApiHelper;
import com.fptgang.backend.util.ProjectTimeline;
import com.google.common.base.Preconditions;
import com.google.common.collect.Sets;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ProjectServiceImpl implements ProjectService {
    private final AuthContext authContext;
    private final ProjectRepos projectRepos;
    private final AccountService accountService;
    private final HirableConfig hirableConfig;
    private final ProposalRepos proposalRepos;
    private final ContractRepos contractRepos;
    private final MilestoneRepos milestoneRepos;
    private final TransactionServiceImpl transactionService;
    private final MilestoneService milestoneService;
    private final AccountRepos accountRepos;
    private final ContractService contractService;

    public ProjectServiceImpl(AuthContext authContext,
                              ProjectRepos projectRepos,
                              AccountService accountService,
                              HirableConfig hirableConfig,
                              ProposalRepos proposalRepos,
                              ContractRepos contractRepos,
                              MilestoneRepos milestoneRepos,
                              TransactionServiceImpl transactionService,
                              MilestoneService milestoneService,
                              AccountRepos accountRepos,
                              ContractService contractService) {
        this.authContext = authContext;
        this.projectRepos = projectRepos;
        this.accountService = accountService;
        this.hirableConfig = hirableConfig;
        this.proposalRepos = proposalRepos;
        this.contractRepos = contractRepos;
        this.milestoneRepos = milestoneRepos;
        this.transactionService = transactionService;
        this.milestoneService = milestoneService;
        this.accountRepos = accountRepos;
        this.contractService = contractService;
    }

    @Override
    @Transactional
    public Project create(Project project) {
        project.setProjectId(null);
        Preconditions.checkArgument(project.getMinBudget().compareTo(BigDecimal.ZERO) > 0,
                "Min budget must be greater than 0");
        Preconditions.checkArgument(project.getMaxBudget().compareTo(BigDecimal.ZERO) > 0,
                "Max budget must be greater than 0");
        Preconditions.checkArgument(project.getMaxBudget().compareTo(project.getMinBudget()) > 0,
                "Max budget must be greater than min budget");
        validateTimeline(project, true);

        project.setClient(accountRepos.getReferenceById(authContext.requireAccountId()));
        log.info("CreateProject, userID = {}", authContext.requireAccountId());
        project.setStatus(Project.ProjectStatus.OPEN);

        for (ProjectSkill skill : project.getRequiredSkills())
            skill.setProject(project);

        BigDecimal totalBudgetRatio = BigDecimal.ZERO;
        for (Milestone milestone : project.getMilestones()) {
            Preconditions.checkArgument(milestone.getBudgetRatio().compareTo(BigDecimal.ZERO) > 0,
                    "Milestone budget ratio must be greater than 0");
            Preconditions.checkArgument(milestone.getBudgetRatio().compareTo(BigDecimal.ONE) <= 0,
                    "Milestone budget ratio must be less than or equal to 1");
            milestone.setStatus(Milestone.MilestoneStatus.PENDING);
            milestone.setFundStatus(Milestone.FundStatus.NONE);
            milestone.setProject(project);
            totalBudgetRatio = totalBudgetRatio.add(milestone.getBudgetRatio());
        }
        if (totalBudgetRatio.compareTo(BigDecimal.ONE) != 0)
            throw new InvalidInputException("Total budget ratio must be 1");

        project = projectRepos.save(project); // also save milestones and project skills
        return project;
    }

    @Override
    public Project update(Project project) {
        Project existing = projectRepos.findByProjectId(project.getProjectId()).orElseThrow(
                () -> new InvalidInputException("Project does not exist"));
        authContext.requireAccountId(existing.getClientId()); // Client operation
        if (existing.getStatus() != Project.ProjectStatus.OPEN)
            throw new IllegalStateException("Only OPEN projects can be updated");
        if (project.getStartDate() != null && project.getStartDate().isBefore(existing.getStartDate()))
            throw new InvalidInputException("Cannot shrink project startDate");
        validateTimeline(project, false);

        if (project.getMilestones() != null && !project.getMilestones().isEmpty()) {
            BigDecimal totalBudgetRatio = BigDecimal.ZERO;
            for (Milestone milestone : project.getMilestones()) {
                Preconditions.checkArgument(milestone.getBudgetRatio().compareTo(BigDecimal.ZERO) > 0,
                        "Milestone budget ratio must be greater than 0");
                Preconditions.checkArgument(milestone.getBudgetRatio().compareTo(BigDecimal.ONE) <= 0,
                        "Milestone budget ratio must be less than or equal to 1");
                milestone.setStatus(Milestone.MilestoneStatus.PENDING);
                milestone.setFundStatus(Milestone.FundStatus.NONE);
                milestone.setProject(project);
                totalBudgetRatio = totalBudgetRatio.add(milestone.getBudgetRatio());
            }
            if (totalBudgetRatio.compareTo(BigDecimal.ONE) != 0)
                throw new InvalidInputException("Total budget ratio must be 1");

            existing.setMilestones(project.getMilestones());

            Set<Long> existingMilestoneIds = existing.getMilestones().stream()
                    .filter(Milestone::getIsVisible)
                    .map(Milestone::getMilestoneId)
                    .collect(Collectors.toSet());
            Set<Long> newMilestoneIds = project.getMilestones().stream()
                    .filter(Milestone::getIsVisible)
                    .map(Milestone::getMilestoneId)
                    .collect(Collectors.toSet());
            log.info("Existing milestones {}", existingMilestoneIds.stream()
                    .map(String::valueOf).collect(Collectors.joining(",")));
            log.info("New milestones {}", existingMilestoneIds.stream()
                    .map(String::valueOf).collect(Collectors.joining(",")));

            for (Long id : Sets.difference(existingMilestoneIds, newMilestoneIds)) {
                log.info("Deleting milestone {}", id);
                milestoneService.deleteById(id);
            }
        }

        if (project.getRequiredSkills() != null && !project.getRequiredSkills().isEmpty()) {
            Map<Long, ProjectSkill> existingSkillsMap = existing.getRequiredSkills().stream()
                    .collect(Collectors.toMap(skill -> skill.getSkill().getSkillId(), skill -> skill));

            List<ProjectSkill> updatedSkills = project.getRequiredSkills().stream()
                    .map(skill -> {
                        ProjectSkill existingSkill = existingSkillsMap.get(skill.getSkill().getSkillId());

                        if (existingSkill != null) {
                            existingSkill.setProficiency(skill.getProficiency());
                            return existingSkill;
                        } else {
                            skill.setProject(existing);
                            return skill;
                        }
                    }).toList();

            existing.getRequiredSkills().removeIf(skill -> !updatedSkills.contains(skill));
            existing.getRequiredSkills().clear();
            existing.getRequiredSkills().addAll(updatedSkills);
        }

        EntityUtil.merge(existing, project);
        return projectRepos.save(existing);
    }

    @Override
    @Transactional
    public Project terminateByClient(Long projectId) {
        Project project = projectRepos.findByProjectId(projectId).orElseThrow(
                () -> new InvalidInputException("Project does not exist"));
        authContext.requireAccountId(project.getClientId()); // Client operation

        // Case 1: If the project is OPEN, terminate immediately
        if (project.getStatus() == Project.ProjectStatus.OPEN) {
            for (Milestone milestone : project.getMilestones())
                milestone.setStatus(Milestone.MilestoneStatus.TERMINATED);
            milestoneRepos.saveAll(project.getMilestones());

            proposalRepos.saveAll(project.getProposals().stream()
                    .filter(p -> p.getStatus() == Proposal.ProposalStatus.PENDING)
                    .peek(p -> p.setStatus(Proposal.ProposalStatus.REJECTED)).toList());

            project.setStatus(Project.ProjectStatus.TERMINATED);
            project.setTerminationReason(Project.TerminationReason.OTHER);
            return projectRepos.save(project);
        }

        // Case 2: If the project is IN PROGRESS, schedule to terminate
        if (project.getStatus() == Project.ProjectStatus.IN_PROGRESS) {
            if (project.getToTerminate())
                throw new IllegalStateException("The project is already scheduled to terminate");
            if (project.getContract() == null ||
                    project.getContract().getStatus() != Contract.ContractStatus.SIGNED ||
                    project.getActiveMilestone() == null ||
                    LocalDateTime.now().isAfter(project.getActiveMilestone().getDeadline().minusDays(2))) {
                throw new IllegalStateException("Cannot terminate project for now");
            }

            project.setToTerminate(true);
            return projectRepos.save(project);
        }

        throw new IllegalStateException("Cannot terminate project for now");
    }

    @Override
    @Transactional
    public Project terminateByStaff(Long projectId, Role transferToRole) {
        authContext.requirePermission(Role.STAFF);

        Project project = projectRepos.findByProjectId(projectId).orElseThrow(
                () -> new InvalidInputException("Project with project id " + projectId + "not found"));
        if (project.getStatus() == Project.ProjectStatus.TERMINATED)
            throw new IllegalStateException("Project is already terminated");

        for (Milestone milestone : project.getMilestones()) {
            if (!milestone.getIsVisible()) continue;

            // IF PENDING, return fund to client (if exists)
            if (milestone.getStatus() == Milestone.MilestoneStatus.PENDING) {
                milestoneService.returnFund(milestone);
            }
            // IF IN PROGRESS, based on staff decision
            else if (milestone.getStatus() == Milestone.MilestoneStatus.IN_PROGRESS) {
                if (transferToRole == Role.CLIENT)
                    milestoneService.returnFund(milestone); // return (if exists)
                else if (transferToRole == Role.FREELANCER)
                    milestoneService.releaseFund(milestone); // release (if exists)
            }
        }

        milestoneRepos.saveAll(project.getMilestones().stream()
                .filter(m -> m.getStatus().canBeTerminated())
                .peek(m -> m.setStatus(Milestone.MilestoneStatus.TERMINATED)).toList());

        proposalRepos.saveAll(project.getProposals().stream()
                .filter(p -> p.getStatus() == Proposal.ProposalStatus.PENDING)
                .peek(p -> p.setStatus(Proposal.ProposalStatus.REJECTED)).toList());

        if (project.getContract() != null)
            project.setContract(contractService.terminateContract(project.getContract()));

        project.setStatus(Project.ProjectStatus.TERMINATED);
        project.setTerminationReason(Project.TerminationReason.STAFF_DECISION);

        return projectRepos.save(project);
    }

    @Override
    @Transactional
    public Project unpause(Long projectId, ProjectTimeline timeline) {
        Project existing = projectRepos.findByProjectId(projectId).orElseThrow(
                () -> new InvalidInputException("Project does not exist"));
        authContext.requireAccountId(existing.getClientId()); // Client operation
        if (existing.getStatus() != Project.ProjectStatus.PAUSED)
            throw new IllegalStateException("Only PAUSED projects can be unpaused");

        existing.setStartDate(timeline.getProjectStartDate());
        for (Milestone milestone : existing.getMilestones()) {
            var date = timeline.getMilestoneDeadlines().get(milestone.getMilestoneId());
            if (date == null || !milestone.getIsVisible()) continue;
            milestone.setDeadline(date);
        }

        validateTimeline(existing, true);
        milestoneRepos.saveAll(existing.getMilestones());
        existing.setStatus(Project.ProjectStatus.OPEN);
        return projectRepos.save(existing);
    }

    @Override
    @Transactional
    public Project extendDeadline(Long projectId, ProjectTimeline timeline) {
        Project existing = projectRepos.findByProjectId(projectId).orElseThrow(
                () -> new InvalidInputException("Project does not exist"));
        authContext.requireAccountId(existing.getClientId()); // Client operation
        if (existing.getToTerminate() || existing.getActiveMilestone() == null)
            throw new IllegalStateException("Cannot extend deadlines for now");
        if (existing.getActiveMilestone().getDeadline().isAfter(LocalDateTime.now()))
            throw new IllegalStateException("Deadline has not passed yet");

        for (Milestone milestone : existing.getMilestones()) {
            var date = timeline.getMilestoneDeadlines().get(milestone.getMilestoneId());
            if (date == null || !milestone.getIsVisible()) continue;
            if (milestone.getMilestoneId() < existing.getActiveMilestone().getMilestoneId())
                throw new IllegalStateException("Cannot extend deadline for past milestones");
            milestone.setDeadline(date);
        }

        validateTimeline(existing, false);
        milestoneRepos.saveAll(existing.getMilestones());
        return existing;
    }

    private void validateTimeline(Project project, boolean checkStartDateWithCurrent) {
        LocalDateTime current = project.getStartDate();
        if (checkStartDateWithCurrent &&
                current != null &&
                current.isBefore(LocalDateTime.now().plusDays(hirableConfig.getMinProjectStartDelay()))) {
            throw new InvalidInputException("Project startDate must be at least " + hirableConfig.getMinProjectStartDelay() + " days later");
        }
        if (project.getMilestones() == null)
            return;
        int visibleCount = 0;
        for (Milestone milestone : project.getMilestones()) {
            if (!milestone.getIsVisible()) continue;
            if (current != null) {
                if (milestone.getDeadline().isBefore(current)) {
                    throw new InvalidInputException(visibleCount == 0 ?
                            "Milestone deadline must be after the project start date" :
                            "Milestone deadline must be after the previous");
                }
                if (milestone.getDeadline().isBefore(current.plusDays(hirableConfig.getMinMilestoneDurationBetween()))) {
                    throw new InvalidInputException("Milestone must have at least " + hirableConfig.getMinMilestoneDurationBetween() + " days in duration");
                }
                if (milestone.getDeadline().isAfter(current.plusDays(hirableConfig.getMaxMilestoneDurationBetween()))) {
                    throw new InvalidInputException("Milestone cannot exceed " + hirableConfig.getMaxMilestoneDurationBetween() + " days in duration");
                }
            }
            visibleCount++;
            current = milestone.getDeadline();
        }
        if (visibleCount < 1) {
            throw new InvalidInputException("Project must have at least 1 visible milestone");
        }
        if (visibleCount > hirableConfig.getMaxMilestoneAmount()) {
            throw new InvalidInputException("Project cannot exceed " + hirableConfig.getMaxMilestoneAmount() + " milestones");
        }
    }

    @Override
    public Project findByProjectId(long projectId) {
        return projectRepos.findByProjectId(projectId).orElseThrow(() -> new InvalidInputException("Project with project id " + projectId + "not found"));
    }

    @Override
    public void deleteById(long projectId) {
        Project project = projectRepos.findByProjectId(projectId)
                .orElseThrow(() -> new InvalidInputException("Project with project id " + projectId + "not found"));
        authContext.requirePermissionOrAccountIds(Role.STAFF, project.getClientId()); // Client operation
        if (project.getStatus() != Project.ProjectStatus.TERMINATED)
            throw new IllegalStateException("Can only delete project when it is terminated");
        project.setIsVisible(false);
        projectRepos.save(project);
    }

    @Override
    public Page<Project> getAll(ListParams params) {
        var spec = OpenApiHelper.groupBy(params.<Project>toSpec(), "projectId");
        return projectRepos.findAll(spec, params.getPageable());
    }

    @Override
    public Page<Project> getProjectsSortedByLatestMessage(Pageable pageable, Boolean includeInvisible, Long participantId) {
        if (participantId == null) {
            throw new InvalidInputException("You are not logged in");
        }
        return projectRepos.findAllSortedByLatestMessage(pageable, includeInvisible, participantId);
    }

    @Override
    public Project joinProject(Long projectId, Long currentUserId) {
        Project project = projectRepos.findByProjectId(projectId).orElseThrow(
                () -> new InvalidInputException("Project with project id " + projectId + "not found"));
        authContext.requirePermission(Role.STAFF);
        if (project.getStaff() != null && !Objects.equals(project.getStaff().getAccountId(), currentUserId)) {
            throw new InvalidInputException("Project already has a staff");
        }
        project.setStaff(
                accountService.findById(currentUserId)
        );
        project.getReports().forEach(report -> {
            if (report.getStatus() == Report.ReportStatus.UNSOLVED) {
                report.setStatus(Report.ReportStatus.SOLVING);
            }
        });
        return projectRepos.save(project);
    }

    @Override
    public Project leaveProject(Long projectId, Long currentUserId) {
        Project project = projectRepos.findByProjectId(projectId).orElseThrow(
                () -> new InvalidInputException("Project with project id " + projectId + "not found"));
        authContext.requirePermission(Role.STAFF);
        if (project.getStaff() == null) {
            throw new InvalidInputException("Project does not have a staff");
        } else if (!Objects.equals(project.getStaff().getAccountId(), currentUserId)) {
            throw new InvalidInputException("You are not a staff of this project");
        }
        project.getReports().forEach(report -> {
            if (report.getStatus() == Report.ReportStatus.UNSOLVED) {
                report.setStatus(Report.ReportStatus.SOLVING);
            }
        });
        project.setStaff(null);
        return projectRepos.save(project);
    }

    /**
     * Task 1: Pause project due to no proposal chosen at 1 day before startDate
     * Runs daily
     */
    @Scheduled(cron = "0 */5 * * * ?")
    @Transactional
    public void pauseProjectsWithNoProposalChosen() {
        LocalDateTime oneDayBeforeStartDate = LocalDateTime.now();

        List<Project> projectsToPause = projectRepos.findByStatusAndStartDateLessThanEqual(
                Project.ProjectStatus.OPEN,
                oneDayBeforeStartDate.plusDays(1)
        );

        for (Project project : projectsToPause) {
            // Set project status to PAUSED
            project.setStatus(Project.ProjectStatus.PAUSED);

            // Update all PENDING proposals to EXPIRED
            List<Proposal> pendingProposals = proposalRepos.findByProjectAndStatus(
                    project,
                    Proposal.ProposalStatus.PENDING
            );

            for (Proposal proposal : pendingProposals) {
                proposal.setStatus(Proposal.ProposalStatus.EXPIRED);
                proposalRepos.save(proposal);
            }

            projectRepos.save(project);
        }
    }

    /**
     * Task 2: Terminate project due to unsigned contract at startDate
     * Runs daily
     */
    @Scheduled(cron = "0 */5 * * * ?")
    @Transactional
    public void terminateProjectsWithUnsignedContract() {
        LocalDateTime currentDate = LocalDateTime.now();

        List<Project> projectsToTerminate = projectRepos.findByStatusAndStartDateLessThanEqual(
                Project.ProjectStatus.IN_PROGRESS,
                currentDate
        );

        for (Project project : projectsToTerminate) {
            Contract contract = project.getContract();

            if (contract != null && contract.getStatus() == Contract.ContractStatus.UNSIGNED) {
                // Terminate project with reason CONTRACT_UNSIGNED
                project.setStatus(Project.ProjectStatus.TERMINATED);
                project.setTerminationReason(Project.TerminationReason.CONTRACT_UNSIGNED);

                // Update contract status to TERMINATED
                contract.setStatus(Contract.ContractStatus.TERMINATED);
                contractRepos.save(contract);

                // Set all milestone status to TERMINATED
                List<Milestone> milestones = project.getMilestones();
                for (Milestone milestone : milestones) {
                    milestone.setStatus(Milestone.MilestoneStatus.TERMINATED);
                    Transaction completedTransaction = transactionService.createEscrowRefund(milestone);
                    if (completedTransaction.getStatus() == Transaction.TransactionStatus.SUCCESS) {
                        milestone.setFundStatus(Milestone.FundStatus.REFUNDED);
                        milestoneRepos.save(milestone);
                    } else {
                        log.error("Failed to refund milestone {} for project {}",
                                milestone.getMilestoneId(), project.getProjectId());
                    }
                    milestoneRepos.save(milestone);
                }
                projectRepos.save(project);
            }
        }
    }

    /**
     * Task 3: Terminate project due to client request
     * Runs daily at midnight
     */
    @Scheduled(cron = "0 */5 * * * ?")
    @Transactional
    public void terminateProjectsPerClientRequest() {
        LocalDateTime currentDate = LocalDateTime.now();

        List<Project> projectsToTerminate = projectRepos.findByStatusAndToTerminate(
                Project.ProjectStatus.IN_PROGRESS,
                true
        );

        for (Project project : projectsToTerminate) {
            Milestone activeMilestone = milestoneRepos.findByProjectAndStatus(project, Milestone.MilestoneStatus.IN_PROGRESS)
                    .orElse(null);

            if (activeMilestone != null && currentDate.isAfter(activeMilestone.getDeadline())) {
                log.info("Terminating project {} due to client request", project.getProjectId());

                // Terminate project with reason CLIENT_REQUEST_TERMINATION
                project.setStatus(Project.ProjectStatus.TERMINATED);
                project.setTerminationReason(Project.TerminationReason.CLIENT_REQUEST_TERMINATION);
                project.setToTerminate(false); // Reset the flag

                // Update contract status to TERMINATED
                Contract contract = project.getContract();
                if (contract != null) {
                    contract.setStatus(Contract.ContractStatus.TERMINATED);
                    contractRepos.save(contract);
                }

                // Process the current (active) milestone - mark as TERMINATED and release funds
                activeMilestone.setStatus(Milestone.MilestoneStatus.TERMINATED);

                try {
                    // Release funds to freelancer for current milestone
                    Transaction releaseTransaction = transactionService.createEscrowRelease(activeMilestone);
                    if (releaseTransaction.getStatus() == Transaction.TransactionStatus.SUCCESS) {
                        activeMilestone.setFundStatus(Milestone.FundStatus.RELEASED);
                        milestoneRepos.save(activeMilestone);
                        log.info("Successfully released funds for active milestone {} in project {}",
                                activeMilestone.getMilestoneId(), project.getProjectId());
                    }
                } catch (Exception e) {
                    log.error("Failed to release funds for active milestone {} in project {}: {}",
                            activeMilestone.getMilestoneId(), project.getProjectId(), e.getMessage());
                    // Continue with termination even if fund release fails
                }

                // Process other milestones
                List<Milestone> milestones = project.getMilestones();
                for (Milestone milestone : milestones) {
                    // Skip the active milestone as we've already processed it
                    if (milestone.equals(activeMilestone)) continue;

                    // Process PENDING and SUCCESS milestones for refund
                    if (milestone.getStatus() == Milestone.MilestoneStatus.PENDING ||
                            milestone.getStatus() == Milestone.MilestoneStatus.FINISHED) {

                        milestone.setStatus(Milestone.MilestoneStatus.TERMINATED);

                        try {
                            // Refund client for these milestones
                            Transaction refundTransaction = transactionService.createEscrowRefund(milestone);
                            if (refundTransaction.getStatus() == Transaction.TransactionStatus.SUCCESS) {
                                milestone.setFundStatus(Milestone.FundStatus.REFUNDED);
                                log.info("Successfully refunded milestone {} for project {}",
                                        milestone.getMilestoneId(), project.getProjectId());
                            }
                        } catch (Exception e) {
                            log.error("Failed to refund milestone {} for project {}: {}",
                                    milestone.getMilestoneId(), project.getProjectId(), e.getMessage());
                            // Continue with termination even if refund fails
                        }
                    }

                    milestoneRepos.save(milestone);
                }

                projectRepos.save(project);
                log.info("Project {} terminated successfully due to client request", project.getProjectId());
            }
        }
    }

}
