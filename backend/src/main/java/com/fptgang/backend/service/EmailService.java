package com.fptgang.backend.service;

import com.fptgang.backend.model.*;

import java.io.IOException;

public interface EmailService {

    void sendMail(String from, String to, String subject, String html);

    void sendResetPasswordEmail(Account account, String resetLink) throws IOException;

    void sendProposalRejectToFreelancer(Long id) throws IOException;

    void sendContractCreatedToFreelancer(Long id) throws IOException;

    void sendContractSignedToFreelancer(Long id) throws IOException;

    void sendContractSignedToClient(Long id) throws IOException;
    void sendMilestoneStartedToFreelancer(Long milestoneId) throws IOException;

    void sendMilestoneStartedToClient(Long milestoneId) throws IOException;

    void sendMilestoneCompletedToClient(Long milestoneId) throws IOException;

    void sendMilestoneCompletedToFreelancer(Long milestoneId) throws IOException;

    void sendMilestoneFundStatusReleaseToFreelancer(Long milestoneId) throws IOException;

    void sendMilestoneFundStatusDepositOrRefundToClient(Long milestoneId) throws IOException;

    void sendProjectEmailTemplateToBoth(Project project) throws IOException;
    void sendReportEmailTemplateToBoth(Report report) throws IOException;

    void sendTransactionEmailTemplateToBoth(Transaction transaction) throws IOException;
}
