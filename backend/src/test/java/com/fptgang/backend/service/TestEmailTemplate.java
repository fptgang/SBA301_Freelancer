package com.fptgang.backend.service;

import com.fptgang.backend.TestcontainersConfiguration;
import com.fptgang.backend.model.*;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;


@Slf4j
@SpringBootTest
@TestConfiguration(proxyBeanMethods = false)
@Testcontainers
@Import(TestcontainersConfiguration.class)
//@Disabled
public class TestEmailTemplate {
    @Autowired
    private EmailService emailService;

    @Test
    public void testProjectPlacedEmail() throws IOException {
        Project project =createExampleProject();
        emailService.sendProjectEmailTemplateToBoth(project.getProjectId());
    }
    
    private static Account createExampleAccount(int i) {
        Account account = new Account();
        account.setRole(i%2==0?Role.CLIENT:Role.FREELANCER);
        account.setFirstName("John");
        account.setLastName("Doe");
        account.setEmail("anhhdSE182336@fpt.edu.vn");
        account.setCreatedAt(LocalDateTime.now());
        account.setUpdatedAt(LocalDateTime.now());
        return account;
    }

    public static Project createExampleProject() {
        Account fre = createExampleAccount(1);
        Account cli = createExampleAccount(2);
        Project project = new Project();
        project.setProjectId(200L);
        project.setClient(cli);
        project.setTitle("Project Title");
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());
        project.setMinBudget(BigDecimal.valueOf(100));
        project.setMaxBudget(BigDecimal.valueOf(200));
        project.setStatus(Project.ProjectStatus.FINISHED);
        project.setStartDate(LocalDateTime.now());
        project.setToTerminate(false);

        Contract contract =new Contract();
        contract.setProject(project);
        contract.setBudget(BigDecimal.valueOf(100));

        Proposal proposal = new Proposal();
        proposal.setFreelancer(fre);

        contract.setFreelancer(proposal.getFreelancer());
        contract.setProposal(proposal);
        project.setContract(contract);

        return project;
    }

}
