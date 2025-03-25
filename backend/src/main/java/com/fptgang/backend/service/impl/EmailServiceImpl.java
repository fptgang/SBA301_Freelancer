package com.fptgang.backend.service.impl;

import com.fptgang.backend.mapper.template.*;
import com.fptgang.backend.model.*;
import com.fptgang.backend.service.EmailService;
import com.fptgang.backend.util.TemplateUtil;
import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    @Value("${RESEND_API_KEY}")
    private String API_KEY;
    @Value("${COMPANY_NAME}")
    private String companyName;
    @Value("${EMAIL_FROM}")
    private String emailFrom;

    @Value("classpath:template/ResetPasswordEmailTemplate.html")
    private Resource resetPasswordEmailTemplate;
    @Value("classpath:template/ProposalRejectEmailTemplate.html")
    private Resource proposalRejectTemplate;
    @Value("classpath:template/ContractCreatedEmailTemplate.html")
    private Resource contractCreateTemplate;
    @Value("classpath:template/ContractSignedEmailTemplate.html")
    private Resource contractSignedTemplate;
    @Value("classpath:template/MilestoneStartedEmailTemplate.html")
    private Resource milestoneStartedTemplate;
    @Value("classpath:template/MilestoneCompletedEmailTemplate.html")
    private Resource milestoneCompletedTemplate;
    @Value("classpath:template/MilestoneFundRefundedEmailTemplate.html")
    private Resource milestoneFundTemplate;
    @Value("classpath:template/ProjectEmailTemplate.html")
    private Resource projectCompletedTemplate;
    @Value("classpath:template/ReportEmailTemplate.html")
    private Resource reportEmailTemplate;
    @Value("classpath:template/TransactionDepositEmailTemplate.html")
    private Resource transactionEmailTemplate;
    @Value("classpath:template/MilestoneFundReleasedEmailTemplate.html")
    private Resource milestoneReleasedEmailTemplate;

    private final ResetPasswordEmailTemplateMapper resetPasswordEmailTemplateMapper;
    private final ContractCreatedEmailTemplateMapper contractCreatedEmailTemplateMapper;
    private final ProposalRejectedEmailTemplateMapper proposalRejectedEmailTemplateMapper;
    private final ContractSignedEmailTemplateMapper contractSignedEmailTemplateMapper;
    private final MilestoneStartedEmailTemplateMapper milestoneStartedEmailTemplateMapper;
    private final MilestoneCompletedEmailTemplateMapper milestoneCompletedEmailTemplateMapper;
    private final MilestoneFundEmailTemplateMapper milestoneFundEmailTemplateMapper;
    private final ProjectEmailTemplateMapper projectEmailTemplateMapper;
    private final ReportEmailTemplateMapper reportEmailTemplateMapper;
    private final TransactionDepositEmailTemplateMapper transactionDepositEmailTemplateMapper;
    private final MilestoneReleasedEmailTemplateMapper milestoneReleasedEmailTemplateMapper;

    public EmailServiceImpl(ContractCreatedEmailTemplateMapper contractCreatedEmailTemplateMapper, ProposalRejectedEmailTemplateMapper proposalRejectedEmailTemplateMapper, ResetPasswordEmailTemplateMapper resetPasswordEmailTemplateMapper, ContractSignedEmailTemplateMapper contractSignedEmailTemplateMapper, MilestoneStartedEmailTemplateMapper milestoneStartedEmailTemplateMapper, MilestoneCompletedEmailTemplateMapper milestoneCompletedEmailTemplateMapper, MilestoneFundEmailTemplateMapper milestoneFundEmailTemplateMapper, ProjectEmailTemplateMapper projectEmailTemplateMapper, ReportEmailTemplateMapper reportEmailTemplateMapper, TransactionDepositEmailTemplateMapper transactionDepositEmailTemplateMapper, MilestoneReleasedEmailTemplateMapper milestoneReleasedEmailTemplateMapper) {
        this.contractCreatedEmailTemplateMapper = contractCreatedEmailTemplateMapper;
        this.proposalRejectedEmailTemplateMapper = proposalRejectedEmailTemplateMapper;
        this.resetPasswordEmailTemplateMapper = resetPasswordEmailTemplateMapper;
        this.contractSignedEmailTemplateMapper = contractSignedEmailTemplateMapper;
        this.milestoneStartedEmailTemplateMapper = milestoneStartedEmailTemplateMapper;
        this.milestoneCompletedEmailTemplateMapper = milestoneCompletedEmailTemplateMapper;
        this.milestoneFundEmailTemplateMapper = milestoneFundEmailTemplateMapper;
        this.projectEmailTemplateMapper = projectEmailTemplateMapper;
        this.reportEmailTemplateMapper = reportEmailTemplateMapper;
        this.transactionDepositEmailTemplateMapper = transactionDepositEmailTemplateMapper;
        this.milestoneReleasedEmailTemplateMapper = milestoneReleasedEmailTemplateMapper;
    }

    @Override
    public void sendMail(String from, String to, String subject, String html) {
        // send email
        Resend resend = new Resend(API_KEY);
        CreateEmailOptions params = CreateEmailOptions.builder()
                //"Acme <onboarding@resend.dev>"
                .from(from )
                .to(to)
                .subject(subject)
                .html(html)
                .build();
        try {
            CreateEmailResponse data = resend.emails().send(params);
            System.out.println(data.getId());
        } catch (ResendException e) {
            log.info(e.getMessage());
        }
    }

    @Override
    public void sendResetPasswordEmail(Account account, String resetLink) throws IOException {
        if (account.getEmail() == null || account.getEmail().isBlank()) {
            throw new IllegalArgumentException("Recipient email is missing.");
        }
        if (resetLink == null || resetLink.isBlank()) {
            throw new IllegalArgumentException("Reset link is missing.");
        }

        log.info("Preparing reset password email for: {}", account.getEmail());

        var template = resetPasswordEmailTemplate.getContentAsString(StandardCharsets.UTF_8);
        var data = resetPasswordEmailTemplateMapper.create(account, resetLink);
        String subject = "Password Reset Request";
        String content = TemplateUtil.render(resetPasswordEmailTemplate.getFilename(), template, data);

        sendMail(emailFrom, account.getEmail(), subject, content);

        log.info("Password reset email successfully sent to: {}", account.getEmail());
    }

    @Override
    public void sendProposalRejectToFreelancer(Proposal proposal) throws IOException {
        if (proposal.getProposalId() == null) {
            throw new IllegalArgumentException("Proposal is missing.");
        }

        log.info("Preparing send proposal reject for: {}", proposal.getFreelancer().getEmail());

        var template = proposalRejectTemplate.getContentAsString(StandardCharsets.UTF_8);
        var data = proposalRejectedEmailTemplateMapper.create(proposal);
        String subject = "Reject Proposal To Freelancer";
        String content = TemplateUtil.render(proposalRejectTemplate.getFilename(),template,data);

        sendMail(emailFrom, proposal.getFreelancer().getEmail(), subject,content);
    }

    @Override
    public void sendContractCreatedToFreelancer(Contract contract) throws IOException {
        if (contract.getContractId() == null) {
            throw new IllegalArgumentException("Contract is missing.");
        }

        log.info("Preparing send contract create for: {}", contract.getFreelancer().getEmail());

        var template = contractCreateTemplate.getContentAsString(StandardCharsets.UTF_8);
        var data = contractCreatedEmailTemplateMapper.create(contract);
        String subject = "Created Contract To Freelancer";
        String content = TemplateUtil.render(contractCreateTemplate.getFilename(),template,data);

        sendMail(emailFrom, contract.getFreelancer().getEmail(), subject,content);
    }

    @Override
    public void sendContractSignedToFreelancer(Contract contract) throws IOException {
        if (contract.getContractId() == null) {
            throw new IllegalArgumentException("Contract is missing.");
        }

        log.info("Preparing send contract sign for: {}", contract.getFreelancer().getEmail());

        var template = contractSignedTemplate.getContentAsString(StandardCharsets.UTF_8);
        var data = contractSignedEmailTemplateMapper.create(contract);
        String subject = "Signed Contract To Freelancer";
        String content = TemplateUtil.render(contractSignedTemplate.getFilename(),template,data);

        sendMail(emailFrom, contract.getFreelancer().getEmail(), subject, content);
    }

    @Override
    public void sendContractSignedToClient(Contract contract) throws IOException {
        if (contract.getContractId() == null) {
            throw new IllegalArgumentException("Contract is missing.");
        }

        log.info("Preparing send contract sign for: {}", contract.getProject().getClient().getEmail());

        var template = contractSignedTemplate.getContentAsString(StandardCharsets.UTF_8);
        var data = contractSignedEmailTemplateMapper.create(contract);
        String subject = "Signed Contract To Client";
        String content = TemplateUtil.render(contractSignedTemplate.getFilename(),template,data);

        sendMail(emailFrom, contract.getProject().getClient().getEmail(), subject, content);
    }

    @Override
    public void sendMilestoneStartedToFreelancer(Milestone milestone) throws IOException {
        if (milestone.getMilestoneId() == null) {
            throw new IllegalArgumentException("Milestone is missing.");
        }

        log.info("Preparing send milestone started for: {}", milestone.requireFreelancer().getEmail());

        var template = milestoneStartedTemplate.getContentAsString(StandardCharsets.UTF_8);
        var data = milestoneStartedEmailTemplateMapper.create(milestone);
        String subject = "Started Milestone To Freelancer";
        String content = TemplateUtil.render(milestoneStartedTemplate.getFilename(),template,data);

        sendMail(emailFrom, milestone.requireFreelancer().getEmail(), subject, content);
    }

    @Override
    public void sendMilestoneStartedToClient(Milestone milestone) throws IOException {
        if (milestone.getMilestoneId() == null) {
            throw new IllegalArgumentException("Milestone is missing.");
        }

        log.info("Preparing send milestone started for: {}", milestone.getProject().getClient().getEmail());

        var template = milestoneStartedTemplate.getContentAsString(StandardCharsets.UTF_8);
        var data = milestoneStartedEmailTemplateMapper.create(milestone);
        String subject = "Started Milestone To Client";
        String content = TemplateUtil.render(milestoneStartedTemplate.getFilename(),template,data);

        sendMail(emailFrom, milestone.getProject().getClient().getEmail(), subject, content);
    }

    @Override
    public void sendMilestoneCompletedToClient(Milestone milestone) throws IOException {
        if (milestone.getMilestoneId() == null) {
            throw new IllegalArgumentException("Milestone is missing.");
        }

        log.info("Preparing send milestone completed for: {}", milestone.getProject().getClient().getEmail());

        var template = milestoneCompletedTemplate.getContentAsString(StandardCharsets.UTF_8);
        var data = milestoneCompletedEmailTemplateMapper.create(milestone);
        String subject = "Completed Milestone To Client";
        String content = TemplateUtil.render(milestoneCompletedTemplate.getFilename(),template,data);

        sendMail(emailFrom, milestone.getProject().getClient().getEmail(), subject, content);
    }

    @Override
    public void sendMilestoneCompletedToFreelancer(Milestone milestone) throws IOException {
        if (milestone.getMilestoneId() == null) {
            throw new IllegalArgumentException("Milestone is missing.");
        }

        log.info("Preparing send milestone completed for: {}", milestone.requireFreelancer().getEmail());

        var template = milestoneCompletedTemplate.getContentAsString(StandardCharsets.UTF_8);
        var data = milestoneCompletedEmailTemplateMapper.create(milestone);
        String subject = "Completed Milestone To Freelancer";
        String content = TemplateUtil.render(milestoneCompletedTemplate.getFilename(),template,data);

        sendMail(emailFrom, milestone.requireFreelancer().getEmail(), subject, content);
    }

    @Override
    public void sendMilestoneFundStatusReleaseToFreelancer(Milestone milestone) throws IOException {
        if (milestone.getMilestoneId() == null) {
            throw new IllegalArgumentException("Milestone is missing.");
        }
        if (milestone.getFundStatus() != Milestone.FundStatus.RELEASED){
            log.info("Milestone fund status is not valid for client notification: {}", milestone.getFundStatus());
            return;
        }
        log.info("Preparing send milestone released for: {}", milestone.requireFreelancer().getEmail());

        var template = milestoneReleasedEmailTemplate.getContentAsString(StandardCharsets.UTF_8);
        var data = milestoneFundEmailTemplateMapper.create(milestone);
        String subject = "Milestone Fund Released";
        String content = TemplateUtil.render(milestoneReleasedEmailTemplate.getFilename(),template,data);

        sendMail(emailFrom, milestone.requireFreelancer().getEmail(), subject, content);
    }

    @Override
    public void sendMilestoneFundStatusDepositOrRefundToClient(Milestone milestone) throws IOException {
        if (milestone.getMilestoneId() == null) {
            throw new IllegalArgumentException("Milestone is missing.");
        }

        if (milestone.getFundStatus() != Milestone.FundStatus.DEPOSITED &&
                milestone.getFundStatus() != Milestone.FundStatus.REFUNDED) {
            log.info("Milestone fund status is not valid for client notification: {}", milestone.getFundStatus());
            return;
        }

        log.info("Preparing to send milestone fund update to client: {}", milestone.getProject().getClient().getEmail());

        var template = milestoneFundTemplate.getContentAsString(StandardCharsets.UTF_8);
        var data = milestoneFundEmailTemplateMapper.create(milestone);

        String subject = milestone.getFundStatus() == Milestone.FundStatus.DEPOSITED
                ? "Milestone Fund Deposited"
                : "Milestone Fund Refunded";

        String content = TemplateUtil.render(milestoneFundTemplate.getFilename(), template, data);

        sendMail(emailFrom, milestone.getProject().getClient().getEmail(), subject, content);
    }

    @Override
    public void sendProjectEmailTemplateToBoth(Project project) throws IOException {
        if (project.getProjectId() == null) {
            throw new IllegalArgumentException("Project is missing.");
        }
        if (project.getStatus() != Project.ProjectStatus.FINISHED && project.getStatus() != Project.ProjectStatus.TERMINATED){
            log.info("Project status is not valid for client notification: {}", project.getStatus());
            return;
        }
        else if(Boolean.TRUE.equals(project.getToTerminate())){
            log.info("Project to be terminate is not valid for client notification: {}", project.getToTerminate());
            return;
        }

        log.info("Preparing to send project completed both to client,freelancer: {} ,{}", project.getClient().getEmail(),project.getFreelancer().getEmail());

        var template = projectCompletedTemplate.getContentAsString(StandardCharsets.UTF_8);
        var data = projectEmailTemplateMapper.create(project);

        String subject = "Project Completed Notification";
        String content = TemplateUtil.render(projectCompletedTemplate.getFilename(), template, data);

        sendMail(emailFrom, project.getClient().getEmail(), subject, content);
        sendMail(emailFrom, project.getFreelancer().getEmail(), subject, content);
    }

    @Override
    public void sendReportEmailTemplateToBoth(Report report) throws IOException {
        if (report.getReportId() == null) {
            throw new IllegalArgumentException("Project is missing.");
        }
        log.info("Preparing to send Report completed both to client,freelancer: {} ,{}", report.getProject().getClient().getEmail(),report.requireFreelancer().getEmail());

        var template = reportEmailTemplate.getContentAsString(StandardCharsets.UTF_8);
        var data = reportEmailTemplateMapper.create(report);

        String subject = "Project Completed Notification";
        String content = TemplateUtil.render(projectCompletedTemplate.getFilename(), template, data);

        sendMail(emailFrom, report.getProject().getClient().getEmail(), subject, content);
        sendMail(emailFrom, report.requireFreelancer().getEmail(), subject, content);
    }

    @Override
    public void sendTransactionEmailTemplateToBoth(Transaction transaction) throws IOException {
        if (transaction.getTransactionId() == null) {
            throw new IllegalArgumentException("Transaction is missing.");
        }

        log.info("Preparing to send transaction completed to client: {}",transaction.getToAccount().getEmail());
        if (transaction.getToAccount().getEmail() == null){
            throw new IOException("Recipient email is missing.");
        }


        var template = transactionEmailTemplate.getContentAsString(StandardCharsets.UTF_8);
        var data = transactionDepositEmailTemplateMapper.create(transaction);

        String subject = "Transaction Completed Notification";
        String content = TemplateUtil.render(transactionEmailTemplate.getFilename(), template, data);

        sendMail(emailFrom, transaction.getFromAccount().getEmail(), subject, content);
    }


}
