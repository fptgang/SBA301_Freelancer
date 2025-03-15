package com.fptgang.backend.service;

import com.fptgang.backend.model.*;

import java.io.IOException;

public interface EmailService {

    void sendMail(String from, String to, String subject, String html);

    void sendResetPasswordEmail(Account account, String resetLink) throws IOException;

    void sendProposalRejectToFreelancer(Proposal proposal) throws IOException;

    void sendContractCreatedToFreelancer(Contract contract) throws IOException;

    void sendContractSignedToFreelancer(Contract contract) throws IOException;

    void sendContractSignedToClient(Contract contract) throws IOException;
    void sendMilestoneStartedToFreelancer(Milestone milestone) throws IOException;

    void sendMilestoneStartedToClient(Milestone milestone) throws IOException;

    void sendMilestoneCompletedToClient(Milestone milestone) throws IOException;

    void sendMilestoneCompletedToFreelancer(Milestone milestone) throws IOException;

    void sendMilestoneFundStatusReleaseToFreelancer(Milestone milestone) throws IOException;

    void sendMilestoneFundStatusDepositOrRefundToClient(Milestone milestone) throws IOException;

    void sendProjectEmailTemplateToBoth(Project project) throws IOException;
    void sendReportEmailTemplateToBoth(Report report) throws IOException;

    void sendTransactionEmailTemplateToBoth(Transaction transaction) throws IOException;
}
