package com.fptgang.backend.service.impl;

import com.fptgang.backend.config.HirableConfig;
import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.*;
import com.fptgang.backend.repository.ContractRepos;
import com.fptgang.backend.repository.MilestoneRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.repository.ProposalRepos;
import com.fptgang.backend.service.AccountService;
import com.fptgang.backend.service.ProjectService;
import com.fptgang.backend.service.ProposalService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.EntityUtil;
import com.fptgang.backend.util.OpenApiHelper;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
public class ProjectServiceImpl implements ProjectService {
    private static final Logger log = LoggerFactory.getLogger(ProjectServiceImpl.class);
    private final ProjectRepos projectRepos;
    private final ProposalService proposalService;
    private final AccountService accountService;
    private final HirableConfig hirableConfig;
    private final ProposalRepos proposalRepos;
    private final ContractRepos contractRepos;
    private final MilestoneRepos milestoneRepos;
    private final TransactionServiceImpl transactionService;

    @Autowired
    public ProjectServiceImpl(ProjectRepos projectRepos, ProposalService proposalService, AccountService accountService, HirableConfig hirableConfig, ProposalRepos proposalRepos, ContractRepos contractRepos, MilestoneRepos milestoneRepos, TransactionServiceImpl transactionService) {
        this.projectRepos = projectRepos;
        this.proposalService = proposalService;
        this.accountService = accountService;
        this.hirableConfig = hirableConfig;
        this.proposalRepos = proposalRepos;
        this.contractRepos = contractRepos;
        this.milestoneRepos = milestoneRepos;
        this.transactionService = transactionService;
    }


    @Override
    public Project create(Project project) {
        // First save the project without milestones
        var milestones = project.getMilestones();
        var skills = project.getRequiredSkills();
        project.setRequiredSkills(null);
        project.setMilestones(null);
        project = projectRepos.save(project);
        // Then set and save milestones if present
        if (milestones != null && !milestones.isEmpty()
                && skills != null && !skills.isEmpty()
        ) {
            Project finalProject = project;
            LocalDateTime lastDeadline = LocalDateTime.now();
            BigDecimal totalBudgetRatio = BigDecimal.ZERO;
            for (var milestone : milestones) {
                milestone.setProject(finalProject);
                if (milestone.getDeadline() != null && milestone.getDeadline().isAfter(lastDeadline)) {
                    lastDeadline = milestone.getDeadline();
                    totalBudgetRatio = totalBudgetRatio.add(milestone.getBudgetRatio());
                } else
                    throw new InvalidInputException("Milestone deadline must be after the previous milestone");
            }
            if (totalBudgetRatio.compareTo(BigDecimal.ONE) != 0) {
                throw new InvalidInputException("Total budget ratio must be 1");
            }
            skills.forEach(skill -> {
                skill.setProject(finalProject);
            });
            project.setRequiredSkills(skills);
            project.setMilestones(milestones);
            project = projectRepos.save(project);
        }
        return project;
    }

    @Override
    public Project update(Project project) {
        if (project.getProjectId() == null) {
            throw new InvalidInputException("Project ID cannot be null");
        }
        Project existing = projectRepos.findByProjectId(project.getProjectId()).orElseThrow(
                () -> new InvalidInputException("Project does not exist"));
        if (existing.getStatus() != Project.ProjectStatus.OPEN) {
            throw new InvalidInputException("Only OPEN projects can be updated");
        }
        if (!existing.getMilestones().isEmpty()){
            throw new InvalidInputException("The minimum amount of milestones is 1, The maximum amount of milestones is 10");
        }
        if (project.getMilestones() != null) {
//            existing.getMilestones().clear();
            if (project.getMilestones().size() > 10) {
                throw new InvalidInputException("Maximum number of milestones is 10");
            }
            LocalDateTime now = LocalDateTime.now();
            if (project.getStartDate() != null && project.getStartDate().isBefore(now.plusDays(3))) {
                throw new InvalidInputException("Start date must be at least 3 days in the future");
            }
            LocalDateTime startDate = project.getStartDate() != null ?
                    project.getStartDate() : existing.getStartDate();

            List<Milestone> milestones = project.getMilestones();
            if (!milestones.isEmpty()) {
                LocalDateTime lastDeadline = startDate;
                BigDecimal totalBudgetRatio = BigDecimal.ZERO;

                for (var milestone : milestones) {
                    milestone.setProject(existing);
                    if (milestone.getDeadline() == null) {
                        throw new InvalidInputException("Milestone deadline cannot be null");
                    }
                    if (milestone.getDeadline().isBefore(lastDeadline.plusDays(hirableConfig.getMinProjectStartDelay()))) {
                        throw new InvalidInputException("Milestone deadlines must be at least 3 days apart");
                    }
                    if (milestone.getDeadline().isAfter(lastDeadline.plusDays(hirableConfig.getMaxMilestoneDurationBetween()))) {
                        throw new InvalidInputException("Milestone deadlines cannot be more than 30 days apart");
                    }

                    lastDeadline = milestone.getDeadline();
                    totalBudgetRatio = totalBudgetRatio.add(milestone.getBudgetRatio());
                }
                if (totalBudgetRatio.compareTo(BigDecimal.ONE) != 0) {
                    throw new InvalidInputException("Total budget ratio must be 1");
                }

                existing.setMilestones(milestones);
            }
        }
        if (project.getRequiredSkills() != null && !project.getRequiredSkills().isEmpty()) {
            project.getRequiredSkills().forEach(skill -> {
                skill.setProject(existing);
                existing.getRequiredSkills().add(skill);
            });
        }
        EntityUtil.merge(existing, project);

        return projectRepos.save(existing);
    }

    @Override
    public Project terminateByClient(Project project) {
        if (project.getProjectId() == null) {
            throw new InvalidInputException("Project ID cannot be null");
        }

        Project existing = projectRepos.findByProjectId(project.getProjectId()).orElseThrow(
                () -> new InvalidInputException("Project does not exist"));

        if (existing.getStatus() != Project.ProjectStatus.OPEN) {
            if (project.getTerminationReason() != Project.TerminationReason.OTHER) {
                throw new InvalidInputException("OPEN projects can only be terminated with reason OTHER");
            }
        }
        // Terminate By Client has contract or not
        if (existing.getContract() == null) {
            // No contract exists → Terminate all milestones & reject proposals
            existing.getMilestones().forEach(milestone -> milestone.setStatus(Milestone.MilestoneStatus.TERMINATED));
            existing.getProposals().forEach(proposal -> proposal.setStatus(Proposal.ProposalStatus.REJECTED));
        } else if (existing.getStatus() == Project.ProjectStatus.IN_PROGRESS) {
            // Contract exists → Terminate after the current milestone
            List<Milestone> milestones = existing.getMilestones();

            // Sort milestones by deadline to find the current and next
            milestones.sort(Comparator.comparing(Milestone::getDeadline));

            LocalDateTime now = LocalDateTime.now();
            Milestone currentMilestone = milestones.stream().filter(milestone -> milestone.getDeadline().isAfter(now) && milestone.getStatus() != Milestone.MilestoneStatus.TERMINATED).findFirst().orElse(null);
            LocalDateTime deadlineMinusTwoDays = currentMilestone.getDeadline().minusDays(2);
            if (now.isAfter(deadlineMinusTwoDays)) {
                throw new InvalidInputException("Termination must be requested at least 2 days before milestone deadline");
            }
            // Pay for the current milestone
            currentMilestone.setStatus(Milestone.MilestoneStatus.FINISHED);
            currentMilestone.setFundStatus(Milestone.FundStatus.RELEASED);

            // Terminate future milestones
            milestones.stream()
                    .filter(m -> m.getDeadline().isAfter(currentMilestone.getDeadline()))
                    .forEach(m -> m.setStatus(Milestone.MilestoneStatus.TERMINATED));
            existing.getProposals()
                    .forEach(proposal -> proposal.setStatus(Proposal.ProposalStatus.REJECTED));
            existing.setToTerminate(true);
        }

        // Set project termination reason and status
        existing.setStatus(Project.ProjectStatus.TERMINATED);
        existing.setTerminationReason(Project.TerminationReason.CLIENT_REQUEST_TERMINATION);
        existing.setToTerminate(true);

        return projectRepos.save(existing);
    }

    @Override
    public Project terminateByStaff(Project account) {
        return null;
    }

    @Override
    public Project unpause(Project project) {
        if (project.getProjectId() == null) {
            throw new InvalidInputException("Project ID cannot be null");
        }

        Project existing = projectRepos.findByProjectId(project.getProjectId()).orElseThrow(
                () -> new InvalidInputException("Project does not exist"));

        // Check if project can be unpaused
        if (existing.getStatus() != Project.ProjectStatus.PAUSED) {
            throw new InvalidInputException("Only PAUSED projects can be unpaused");
        }

        // Check if project has contract (should not have one if just paused)
        if (existing.getContract() != null) {
            throw new InvalidInputException("Project with contract cannot be unpaused this way");
        }

        List<Milestone> updatedMilestones = project.getMilestones();
        if (updatedMilestones == null || updatedMilestones.isEmpty()) {
            throw new InvalidInputException("Milestone deadlines must be provided for unpausing");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime newStartDate = project.getStartDate();

        if (newStartDate == null) {
            newStartDate = now.plusDays(hirableConfig.getMinProjectStartDelay());
        } else if (newStartDate.isBefore(now.plusDays(hirableConfig.getMinProjectStartDelay()))) {
            throw new InvalidInputException("Start date must be at least " +
                    hirableConfig.getMinProjectStartDelay() + " days in the future");
        }

        existing.setStartDate(newStartDate);

        // Sort existing and updated milestones by deadline
        List<Milestone> existingMilestones = existing.getMilestones();
        existingMilestones.sort(Comparator.comparing(Milestone::getDeadline));
        updatedMilestones.sort(Comparator.comparing(Milestone::getDeadline));

        // Validate milestones match in count
        if (existingMilestones.size() != updatedMilestones.size()) {
            throw new InvalidInputException("Number of milestones must match the original project");
        }

        // Update milestone deadlines
        LocalDateTime lastDeadline = newStartDate;
        for (int i = 0; i < updatedMilestones.size(); i++) {
            Milestone updatedMilestone = updatedMilestones.get(i);
            Milestone existingMilestone = existingMilestones.get(i);

            // Validate milestone deadline
            if (updatedMilestone.getDeadline() == null) {
                throw new InvalidInputException("Milestone deadline cannot be null");
            }

            if (updatedMilestone.getDeadline().isBefore(lastDeadline.plusDays(hirableConfig.getMinProjectStartDelay()))) {
                throw new InvalidInputException("Milestone deadlines must be at least " +
                        hirableConfig.getMinProjectStartDelay() + " days apart");
            }

            if (updatedMilestone.getDeadline().isAfter(lastDeadline.plusDays(hirableConfig.getMaxMilestoneDurationBetween()))) {
                throw new InvalidInputException("Milestone deadlines cannot be more than " +
                        hirableConfig.getMaxMilestoneDurationBetween() + " days apart");
            }

            // Update the deadline
            existingMilestone.setDeadline(updatedMilestone.getDeadline());
            lastDeadline = updatedMilestone.getDeadline();
        }


        existing.setStatus(Project.ProjectStatus.OPEN);

        return projectRepos.save(existing);
    }

    @Override
    public Project extendDeadline(Project project) {
        if (project.getProjectId() == null) {
            throw new InvalidInputException("Project ID cannot be null");
        }

        Project existing = projectRepos.findByProjectId(project.getProjectId()).orElseThrow(
                () -> new InvalidInputException("Project does not exist"));

        // Check if project has an active milestone (implying contract is made and SIGNED)
        if (existing.getStatus() != Project.ProjectStatus.IN_PROGRESS) {
            throw new InvalidInputException("Only IN_PROGRESS projects can have deadlines extended");
        }

        // Check if project is not scheduled for termination
        if (Boolean.TRUE.equals(existing.getToTerminate())) {
            throw new InvalidInputException("Cannot extend deadline for a project scheduled for termination");
        }

        // Find the active milestone
        Milestone activeMilestone = existing.getMilestones().stream()
                .filter(m -> m.getStatus() == Milestone.MilestoneStatus.IN_PROGRESS)
                .findFirst()
                .orElseThrow(() -> new InvalidInputException("No active milestone found for this project"));

        // Check if the current activeMilestone is late (current date is after deadline)
        LocalDateTime now = LocalDateTime.now();
        if (!now.isAfter(activeMilestone.getDeadline())) {
            throw new InvalidInputException("Current milestone is not late. Deadline extension is only allowed for late milestones");
        }

        // Get the new deadline for the active milestone
        LocalDateTime newDeadline = null;
        for (Milestone milestone : project.getMilestones()) {
            if (milestone.getMilestoneId().equals(activeMilestone.getMilestoneId())) {
                newDeadline = milestone.getDeadline();
                break;
            }
        }

        if (newDeadline == null) {
            throw new InvalidInputException("New deadline for active milestone must be provided");
        }

        // Ensure the new deadline is in the future
        if (newDeadline.isBefore(now)) {
            throw new InvalidInputException("New deadline must be in the future");
        }

        // Sort milestones by deadline to maintain chronological order
        List<Milestone> existingMilestones = existing.getMilestones().stream()
                .sorted((m1, m2) -> m1.getDeadline().compareTo(m2.getDeadline()))
                .toList();

        // Find the index of the active milestone
        int activeMilestoneIndex = -1;
        for (int i = 0; i < existingMilestones.size(); i++) {
            if (existingMilestones.get(i).getMilestoneId().equals(activeMilestone.getMilestoneId())) {
                activeMilestoneIndex = i;
                break;
            }
        }

        if (activeMilestoneIndex == -1) {
            throw new InvalidInputException("Cannot find active milestone in the project's milestone list");
        }

        // Update the active milestone's deadline
        activeMilestone.setDeadline(newDeadline);

        // If there are future milestones, adjust their deadlines
        LocalDateTime lastDeadline = newDeadline;
        for (int i = activeMilestoneIndex + 1; i < existingMilestones.size(); i++) {
            Milestone futureMilestone = existingMilestones.get(i);

            // Find if there's a corresponding update in the provided milestones
            LocalDateTime providedDeadline = null;
            for (Milestone milestone : project.getMilestones()) {
                if (milestone.getMilestoneId().equals(futureMilestone.getMilestoneId())) {
                    providedDeadline = milestone.getDeadline();
                    break;
                }
            }

            // If a new deadline was provided for this milestone, use it
            if (providedDeadline != null) {
                // Check that it's at least 3 days after the previous milestone
                if (providedDeadline.isBefore(lastDeadline.plusDays(hirableConfig.getMinMilestoneDurationBetween()))) {
                    throw new InvalidInputException("Milestone deadlines must be at least 3 days apart");
                }

                // Check that it's not more than 30 days after the previous milestone
                if (providedDeadline.isAfter(lastDeadline.plusDays(hirableConfig.getMaxMilestoneDurationBetween()))) {
                    throw new InvalidInputException("Milestone deadlines cannot be more than 30 days apart");
                }

                futureMilestone.setDeadline(providedDeadline);
                lastDeadline = providedDeadline;
            }
            // Otherwise, check if existing deadline still satisfies the constraints
            else {
                // If not at least 3 days after previous deadline, adjust it
                if (futureMilestone.getDeadline().isBefore(lastDeadline.plusDays(hirableConfig.getMinMilestoneDurationBetween()))) {
                    futureMilestone.setDeadline(lastDeadline.plusDays(hirableConfig.getMinMilestoneDurationBetween()));
                }

                lastDeadline = futureMilestone.getDeadline();
            }
        }
        return projectRepos.save(existing);
    }

    @Override
    public Project findByProjectId(long projectId) {
        Project project = projectRepos.findByProjectId(projectId).orElseThrow(() -> new InvalidInputException("Project with project id " + projectId + "not found"));
        return project;
    }

    @Override
    public void deleteById(long projectId) {
        Project project = projectRepos.findByProjectId(projectId).orElseThrow(() -> new InvalidInputException("Project with project id " + projectId + "not found"));
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
    public void acceptProjectProposal(long projectId, long proposalId) {
//        Project project = projectRepos.findByProjectId(projectId).orElseThrow(
//                 () -> new InvalidInputException("Project with project id " + projectId + "not found"));
//        if(project.getActiveProposal() != null) {
//            throw new InvalidInputException("Project already has an active proposal");
//        }
//        Proposal proposal = proposalService.findById(proposalId);
//        if(proposal.getProject().getProjectId() != projectId) {
//            throw new InvalidInputException("Proposal does not belong to this project");
//        }
//        proposal.setStatus(Proposal.ProposalStatus.ACCEPTED);
//        proposal=proposalService.update(proposal);
//        project.setActiveProposal(proposal);
//        for(Proposal p : project.getProposals()) {
//            if(p.getProposalId() != proposalId) {
//                p.setStatus(Proposal.ProposalStatus.REJECTED);
//                proposalService.update(proposal);
//            }
//        }
//        projectRepos.save(project);
    }

    @Override
    public void rejectProjectProposal(long projectId, long proposalId) {
        Project project = projectRepos.findByProjectId(projectId).orElseThrow(
                () -> new InvalidInputException("Project with project id " + projectId + "not found"));
        Proposal proposal = proposalService.findById(proposalId);
        if (proposal.getProject().getProjectId() != projectId) {
            throw new InvalidInputException("Proposal does not belong to this project");
        }
        proposal.setStatus(Proposal.ProposalStatus.REJECTED);
        proposalService.update(proposal);
    }

    @Override
    public Project joinProject(Long projectId, Long currentUserId) {
        Project project = projectRepos.findByProjectId(projectId).orElseThrow(
                () -> new InvalidInputException("Project with project id " + projectId + "not found"));
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
                            milestone.getStatus() == Milestone.MilestoneStatus.SUCCESS) {

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
