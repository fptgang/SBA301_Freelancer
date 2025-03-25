package com.fptgang.backend.controller;

import com.fptgang.backend.model.Proposal;
import com.fptgang.backend.repository.ProposalRepos;
import com.fptgang.backend.service.EmailService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/emails")
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/milestone-started-freelancer/{milestoneId}")
    public ResponseEntity<String> sendMilestoneStartedToFreelancer(@PathVariable Long milestoneId) {
        try {
            emailService.sendMilestoneStartedToFreelancer(milestoneId);
            return ResponseEntity.ok("Milestone started email to freelancer sent");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error sending email: " + e.getMessage());
        }
    }

    @PostMapping("/milestone-started-client/{milestoneId}")
    public ResponseEntity<String> sendMilestoneStartedToClient(@PathVariable Long milestoneId) {
        try {
            emailService.sendMilestoneStartedToClient(milestoneId);
            return ResponseEntity.ok("Milestone started email to client sent");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error sending email: " + e.getMessage());
        }
    }

    @PostMapping("/milestone-completed-client/{milestoneId}")
    public ResponseEntity<String> sendMilestoneCompletedToClient(@PathVariable Long milestoneId) {
        try {
            emailService.sendMilestoneCompletedToClient(milestoneId);
            return ResponseEntity.ok("Milestone completed email to Client sent");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error sending email: " + e.getMessage());
        }
    }

    @PostMapping("/milestone-completed-freelancer/{milestoneId}")
    public ResponseEntity<String> sendMilestoneCompletedToFreelancer(@PathVariable Long milestoneId) {
        try {
            emailService.sendMilestoneCompletedToFreelancer(milestoneId);
            return ResponseEntity.ok("Milestone completed email to freelancer sent");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error sending email: " + e.getMessage());
        }
    }


    @PostMapping("/milestone-FundRelease-freelancer/{milestoneId}")
    public ResponseEntity<String> sendMilestoneFundStatusReleaseToFreelancer(@PathVariable Long milestoneId) {
        try {
            emailService.sendMilestoneFundStatusReleaseToFreelancer(milestoneId);
            return ResponseEntity.ok("Milestone FundStatusRelease email to freelancer sent");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error sending email: " + e.getMessage());
        }
    }

    @PostMapping("/milestone-FundDepositRefund-client/{milestoneId}")
    public ResponseEntity<String> sendMilestoneFundStatusDepositOrRefundToClient(@PathVariable Long milestoneId) {
        try {
            emailService.sendMilestoneFundStatusDepositOrRefundToClient(milestoneId);
            return ResponseEntity.ok("Milestone FundStatusDepositOrRefund started email to client sent");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error sending email: " + e.getMessage());
        }
    }

    @PostMapping("/contract-signed-client/{contractId}")
    public ResponseEntity<String> sendContractSignedToClient(@PathVariable Long contractId) {
        try {
            emailService.sendContractSignedToClient(contractId);
            return ResponseEntity.ok("Contract signed email sent");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error sending email: " + e.getMessage());
        }
    }

    @PostMapping("/contract-signed-freelancer/{contractId}")
    public ResponseEntity<String> sendContractSignedToFreelancer(@PathVariable Long contractId) {
        try {
            emailService.sendContractSignedToFreelancer(contractId);
            return ResponseEntity.ok("Contract signed email sent");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error sending email: " + e.getMessage());
        }
    }

    @PostMapping("/contract-created-freelancer/{contractId}")
    public ResponseEntity<String> sendContractCreatedToFreelancer(@PathVariable Long contractId) {
        try {
            emailService.sendContractCreatedToFreelancer(contractId);
            return ResponseEntity.ok("Contract signed email sent");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error sending email: " + e.getMessage());
        }
    }

    @PostMapping("/proposal-reject-freelancer/{proposalId}")
    public ResponseEntity<String> sendProposalRejectToFreelancer(@PathVariable Long proposalId) {
        try {
            emailService.sendProposalRejectToFreelancer(proposalId);
            return ResponseEntity.ok("Proposal Reject email sent");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error sending email: " + e.getMessage());
        }
    }

    @PostMapping("/project-completed/{projectId}")
    public ResponseEntity<String> sendProjectCompletedToBoth(@PathVariable Long projectId) {
        try {
            emailService.sendProjectEmailTemplateToBoth(projectId);
            return ResponseEntity.ok("Project Completed email sent");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error sending email: " + e.getMessage());
        }
    }

    @PostMapping("/report/{reportId}")
    public ResponseEntity<String> sendReportEmailTemplateToBoth(@PathVariable Long reportId) {
        try {
            emailService.sendReportEmailTemplateToBoth(reportId);
            return ResponseEntity.ok("Report email sent");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error sending email: " + e.getMessage());
        }
    }

    @PostMapping("/transaction/{transactionId}")
    public ResponseEntity<String> sendTransactionEmailTemplateToBoth(@PathVariable Long transactionId) {
        try {
            emailService.sendTransactionEmailTemplateToBoth(transactionId);
            return ResponseEntity.ok("Transaction email sent");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error sending email: " + e.getMessage());
        }
    }
}
