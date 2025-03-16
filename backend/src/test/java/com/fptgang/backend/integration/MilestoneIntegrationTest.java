package com.fptgang.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fptgang.backend.TestcontainersConfiguration;
import com.fptgang.backend.api.model.MilestoneDto;
import com.fptgang.backend.api.model.MilestoneFundStatusDto;
import com.fptgang.backend.api.model.MilestoneStatusDto;
import com.fptgang.backend.model.*;
import com.fptgang.backend.repository.*;
import com.fptgang.backend.security.WithMockAppUser;
import com.fptgang.backend.service.AzureBlobService;
import com.fptgang.backend.service.ContractService;
import com.fptgang.backend.service.MilestoneService;
import com.fptgang.backend.service.ProposalService;
import com.fptgang.backend.util.SecurityUtil;
import org.junit.jupiter.api.*;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.annotation.Commit;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mockStatic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@RunWith(SpringRunner.class)
@Import(TestcontainersConfiguration.class)
@ActiveProfiles("dev")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
public class MilestoneIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AccountRepos accountRepos;
    @Autowired
    private ProjectCategoryRepos projectCategoryRepos;
    @Autowired
    private ProjectRepos projectRepos;
    @Autowired
    private ContractRepos contractRepos;
    @Autowired
    private ProposalRepos proposalRepos;
    @Autowired
    private FileRepos fileRepos;

    @Autowired
    private ProposalService proposalService;
    @Autowired
    private ContractService contractService;
    @Autowired
    private MilestoneService milestoneService;

    @MockitoBean
    private AzureBlobService azureBlobService;
    private static MockedStatic<SecurityUtil> securityUtilMock;

    private ProjectCategory projectCategory;
    private Account clientAccount;
    private Account freelancerAccount;
    private Project project;
    private Contract contract;
    private Proposal proposal;

    @BeforeAll
    @Transactional
    public void init() {
        projectRepos.deleteAll();

        projectCategoryRepos.deleteAll();
        projectCategory = projectCategoryRepos.save(ProjectCategory.builder().name("Test").isVisible(true).build());

        accountRepos.deleteAll();
        clientAccount = accountRepos.save(
                Account.builder() // ID=2
                        .email("client@example.com")
                        .firstName("Client")
                        .role(Role.CLIENT)
                        .balance(BigDecimal.valueOf(5000))
                        .isVerified(true)
                        .isVisible(true)
                        .build()
        );
        freelancerAccount = accountRepos.save(
                Account.builder() // ID=3
                        .email("freelancer1@example.com")
                        .firstName("Freelancer 1")
                        .role(Role.FREELANCER)
                        .isVerified(true)
                        .isVisible(true)
                        .build()
        );
        securityUtilMock = mockStatic(SecurityUtil.class);
        MockitoAnnotations.openMocks(this);
    }

    private void mockSecurityAsClient() {
        securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(2L);
        securityUtilMock.when(SecurityUtil::getCurrentUserEmail).thenReturn("client@example.com");
        securityUtilMock.when(SecurityUtil::getCurrentUserRole).thenReturn(Role.CLIENT);
        securityUtilMock.when(SecurityUtil::isAuthenticated).thenReturn(true);
    }

    private void mockSecurityAsFreelancer() {
        securityUtilMock.when(SecurityUtil::getCurrentUserId).thenReturn(3L);
        securityUtilMock.when(SecurityUtil::getCurrentUserEmail).thenReturn("freelancer1@example.com");
        securityUtilMock.when(SecurityUtil::getCurrentUserRole).thenReturn(Role.FREELANCER);
        securityUtilMock.when(SecurityUtil::isAuthenticated).thenReturn(true);
    }

    @BeforeEach
    @Transactional
    public void setUp() {
        fileRepos.deleteAll();
        contractRepos.deleteAll();
        proposalRepos.deleteAll();
        projectRepos.deleteAll();

        project = Project.builder()
                .title("Original Title")
                .description("Original Description")
                .minBudget(BigDecimal.valueOf(100))
                .maxBudget(BigDecimal.valueOf(500))
                .startDate(LocalDateTime.now().plusDays(7))
                .status(Project.ProjectStatus.OPEN)
                .client(clientAccount)
                .category(projectCategory)
                .isVisible(true)
                .build();
        project.setMilestones(new ArrayList<>(
                List.of(
                        Milestone.builder()
                                .project(project)
                                .title("Milestone 1")
                                .budgetRatio(BigDecimal.valueOf(0.4))
                                .deadline(LocalDateTime.now().plusDays(12))
                                .status(Milestone.MilestoneStatus.PENDING)
                                .fundStatus(Milestone.FundStatus.NONE)
                                .build(),
                        Milestone.builder()
                                .project(project)
                                .title("Milestone Deleted")
                                .budgetRatio(BigDecimal.valueOf(0.4))
                                .deadline(LocalDateTime.now().plusDays(12))
                                .status(Milestone.MilestoneStatus.PENDING)
                                .fundStatus(Milestone.FundStatus.NONE)
                                .isVisible(false)
                                .build(),
                        Milestone.builder()
                                .project(project)
                                .title("Milestone 2")
                                .budgetRatio(BigDecimal.valueOf(0.6))
                                .deadline(LocalDateTime.now().plusDays(15))
                                .status(Milestone.MilestoneStatus.PENDING)
                                .fundStatus(Milestone.FundStatus.NONE)
                                .build())
        ));
        project = projectRepos.save(project);

        mockSecurityAsFreelancer();
        proposal = proposalService.create(Proposal.builder()
                .freelancer(freelancerAccount)
                .project(project)
                .status(Proposal.ProposalStatus.PENDING)
                .budget(BigDecimal.valueOf(100))
                .build());

        mockSecurityAsClient();
        contract = contractService.create(proposal.getProposalId());

        mockSecurityAsFreelancer();
        contract = contractService.signContract(contract.getContractId());
    }

    @Test
    @WithMockAppUser(accountId = 2, username = "client@example.com", role = "ROLE_CLIENT")
    public void testClientFundFirstMilestone_FailedDueToFunded() throws Exception {
        mockSecurityAsClient();
        Milestone milestone = project.getMilestones().getFirst();
        mockMvc.perform(post("/api/v1/milestones/" + milestone.getMilestoneId() + "/deposit-fund")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockAppUser(accountId = 2, username = "client@example.com", role = "ROLE_CLIENT")
    public void testClientFundSecondMilestone_FailedDueToInvisibility() throws Exception {
        mockSecurityAsClient();
        Milestone milestone = project.getMilestones().get(1);
        mockMvc.perform(post("/api/v1/milestones/" + milestone.getMilestoneId() + "/deposit-fund")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockAppUser(accountId = 2, username = "client@example.com", role = "ROLE_CLIENT")
    public void testClientFund_Success() throws Exception {
        mockSecurityAsClient();
        Milestone milestone = project.getMilestones().get(2);
        String response = mockMvc.perform(post("/api/v1/milestones/" + milestone.getMilestoneId() + "/deposit-fund")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        var dto = objectMapper.readValue(response, MilestoneDto.class);
        assertThat(dto.getStatus()).isEqualTo(MilestoneStatusDto.PENDING);
        assertThat(dto.getFundStatus()).isEqualTo(MilestoneFundStatusDto.DEPOSITED);

        // duplication
        mockMvc.perform(post("/api/v1/milestones/" + milestone.getMilestoneId() + "/deposit-fund")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockAppUser(accountId = 3, username = "freelancer1@example.com", role = "ROLE_FREELANCER")
    public void testFreelancerFund_Forbidden() throws Exception {
        mockSecurityAsFreelancer();
        Milestone milestone = project.getMilestones().get(2);
        mockMvc.perform(post("/api/v1/milestones/" + milestone.getMilestoneId() + "/deposit-fund")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockAppUser(accountId = 3, username = "freelancer1@example.com", role = "ROLE_FREELANCER")
    public void testFreelancer1SubmitWork_FailedDueToWrongStatus() throws Exception {
        mockSecurityAsFreelancer();
        Milestone milestone = project.getMilestones().get(2);
        mockMvc.perform(
                        multipart("/api/v1/milestones/" + milestone.getMilestoneId() + "/submit-work")
                                .file(new MockMultipartFile(
                                        "blobs",
                                        "file1.txt",
                                        "text/plain",
                                        "File 1 content".getBytes()
                                ))
                                .contentType(MediaType.MULTIPART_FORM_DATA)
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockAppUser(accountId = 3, username = "freelancer1@example.com", role = "ROLE_FREELANCER")
    public void testFreelancer1SubmitWork_Success() throws Exception {
        mockSecurityAsFreelancer();
        final String dummyUrl = "https://dummy.blob.url/test.txt";
        Mockito.when(azureBlobService.upload(Mockito.any(MultipartFile.class), Mockito.anyString()))
                .thenReturn(dummyUrl);

        Milestone milestone = project.getMilestones().getFirst();
        String response = mockMvc.perform(
                        multipart("/api/v1/milestones/" + milestone.getMilestoneId() + "/submit-work")
                                .file(new MockMultipartFile(
                                        "blobs",
                                        "file1.txt",
                                        "text/plain",
                                        "File 1 content".getBytes()
                                ))
                                .file(new MockMultipartFile(
                                        "blobs",
                                        "file2.txt",
                                        "text/plain",
                                        "File 2 content".getBytes()
                                ))
                                .contentType(MediaType.MULTIPART_FORM_DATA)
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        var dto = objectMapper.readValue(response, MilestoneDto.class);
        assertThat(dto.getStatus()).isEqualTo(MilestoneStatusDto.REVIEWING);
        assertThat(dto.getFundStatus()).isEqualTo(MilestoneFundStatusDto.DEPOSITED);

        assertThat(dto.getDeliverables().getFirst().getFileUrl()).isEqualTo(dummyUrl);
        assertThat(dto.getDeliverables().getFirst().getFileName()).startsWith("file1");
        assertThat(dto.getDeliverables().getFirst().getMilestoneId()).isEqualTo(milestone.getMilestoneId());
        assertThat(dto.getDeliverables().getFirst().getUploader()).isNotNull();
        assertThat(dto.getDeliverables().getFirst().getUploader().getAccountId()).isEqualTo(freelancerAccount.getAccountId());

        assertThat(dto.getDeliverables().getLast().getFileUrl()).isEqualTo(dummyUrl);
        assertThat(dto.getDeliverables().getLast().getFileName()).startsWith("file2");
        assertThat(dto.getDeliverables().getLast().getMilestoneId()).isEqualTo(milestone.getMilestoneId());
        assertThat(dto.getDeliverables().getLast().getUploader()).isNotNull();
        assertThat(dto.getDeliverables().getLast().getUploader().getAccountId()).isEqualTo(freelancerAccount.getAccountId());
    }

    @Test
    @WithMockAppUser(accountId = 3, username = "freelancer1@example.com", role = "ROLE_FREELANCER")
    @Transactional
    @Commit
    public void testFreelancer1SubmitMoreWork_Success() throws Exception {
        mockSecurityAsFreelancer();
        final String dummyUrl = "https://dummy.blob.url/test.txt";
        Mockito.when(azureBlobService.upload(Mockito.any(MultipartFile.class), Mockito.anyString()))
                .thenReturn(dummyUrl);

        Milestone milestone = project.getMilestones().getFirst();

        milestoneService.submitWork(milestone, List.of(
                new MockMultipartFile(
                        "blobs",
                        "file1.txt",
                        "text/plain",
                        "File 1 content".getBytes()
                ),
                new MockMultipartFile(
                        "blobs",
                        "file2.txt",
                        "text/plain",
                        "File 2 content".getBytes()
                )
        ));

        String response = mockMvc.perform(
                        multipart("/api/v1/milestones/" + milestone.getMilestoneId() + "/submit-work")
                                .file(new MockMultipartFile(
                                        "blobs",
                                        "file3.txt",
                                        "text/plain",
                                        "File 3 content".getBytes()
                                ))
                                .contentType(MediaType.MULTIPART_FORM_DATA)
                                .accept(MediaType.APPLICATION_JSON)
                )
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        var dto = objectMapper.readValue(response, MilestoneDto.class);
        assertThat(dto.getStatus()).isEqualTo(MilestoneStatusDto.REVIEWING);
        assertThat(dto.getFundStatus()).isEqualTo(MilestoneFundStatusDto.DEPOSITED);

        assertThat(dto.getDeliverables().getFirst().getFileUrl()).isEqualTo(dummyUrl);
        assertThat(dto.getDeliverables().getFirst().getFileName()).startsWith("file1");
        assertThat(dto.getDeliverables().getFirst().getMilestoneId()).isEqualTo(milestone.getMilestoneId());
        assertThat(dto.getDeliverables().getFirst().getUploader()).isNotNull();
        assertThat(dto.getDeliverables().getFirst().getUploader().getAccountId()).isEqualTo(freelancerAccount.getAccountId());

        assertThat(dto.getDeliverables().get(1).getFileUrl()).isEqualTo(dummyUrl);
        assertThat(dto.getDeliverables().get(1).getFileName()).startsWith("file2");
        assertThat(dto.getDeliverables().get(1).getMilestoneId()).isEqualTo(milestone.getMilestoneId());
        assertThat(dto.getDeliverables().get(1).getUploader()).isNotNull();
        assertThat(dto.getDeliverables().get(1).getUploader().getAccountId()).isEqualTo(freelancerAccount.getAccountId());

        assertThat(dto.getDeliverables().getLast().getFileUrl()).isEqualTo(dummyUrl);
        assertThat(dto.getDeliverables().getLast().getFileName()).startsWith("file3");
        assertThat(dto.getDeliverables().getLast().getMilestoneId()).isEqualTo(milestone.getMilestoneId());
        assertThat(dto.getDeliverables().getLast().getUploader()).isNotNull();
        assertThat(dto.getDeliverables().getLast().getUploader().getAccountId()).isEqualTo(freelancerAccount.getAccountId());
    }

    @Test
    @WithMockAppUser(accountId = 3, username = "freelancer1@example.com", role = "ROLE_FREELANCER")
    public void testFreelancerConfirmWork_Forbidden() throws Exception {
        Mockito.when(azureBlobService.upload(Mockito.any(MultipartFile.class), Mockito.anyString())).thenReturn("#");
        mockSecurityAsFreelancer();
        Milestone milestone = project.getMilestones().getFirst();
        milestone = milestoneService.submitWork(milestone, List.of(
                new MockMultipartFile(
                        "blobs",
                        "file1.txt",
                        "text/plain",
                        "File 1 content".getBytes()
                ),
                new MockMultipartFile(
                        "blobs",
                        "file2.txt",
                        "text/plain",
                        "File 2 content".getBytes()
                )
        ));

        mockMvc.perform(post("/api/v1/milestones/" + milestone.getMilestoneId() + "/confirm-work")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockAppUser(accountId = 2, username = "client@example.com", role = "ROLE_CLIENT")
    public void testClientConfirmWork_FailedDueToNotStarted() throws Exception {
        mockSecurityAsClient();
        Milestone milestone = project.getMilestones().get(2);
        mockMvc.perform(post("/api/v1/milestones/" + milestone.getMilestoneId() + "/confirm-work")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockAppUser(accountId = 2, username = "client@example.com", role = "ROLE_CLIENT")
    @Transactional
    @Commit
    public void testClientConfirmWorkNextMilestone_Success() throws Exception {
        Mockito.when(azureBlobService.upload(Mockito.any(MultipartFile.class), Mockito.anyString())).thenReturn("#");
        mockSecurityAsFreelancer();
        Milestone milestone = project.getMilestones().getFirst();
        milestone = milestoneService.submitWork(milestone, List.of(
                new MockMultipartFile(
                        "blobs",
                        "file1.txt",
                        "text/plain",
                        "File 1 content".getBytes()
                ),
                new MockMultipartFile(
                        "blobs",
                        "file2.txt",
                        "text/plain",
                        "File 2 content".getBytes()
                )
        ));

        mockSecurityAsClient();
        String response = mockMvc.perform(post("/api/v1/milestones/" + milestone.getMilestoneId() + "/confirm-work")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        var dto = objectMapper.readValue(response, MilestoneDto.class);
        assertThat(dto.getStatus()).isEqualTo(MilestoneStatusDto.IN_PROGRESS);
        assertThat(dto.getFundStatus()).isEqualTo(MilestoneFundStatusDto.DEPOSITED);

        project = projectRepos.findById(project.getProjectId()).orElseThrow();
        assertThat(project.getActiveMilestone()).isNotNull();
        assertThat(project.getActiveMilestone().getMilestoneId()).isEqualTo(project.getMilestones().get(2).getMilestoneId());
    }

    @Test
    @WithMockAppUser(accountId = 2, username = "client@example.com", role = "ROLE_CLIENT")
    @Transactional
    @Commit
    public void testClientConfirmWorkFinishProject_Success() throws Exception {
        Mockito.when(azureBlobService.upload(Mockito.any(MultipartFile.class), Mockito.anyString())).thenReturn("#");
        // MILESTONE ID=1
        Milestone milestone = project.getMilestones().getFirst();
        mockSecurityAsFreelancer();
        milestone = milestoneService.submitWork(milestone, List.of(
                new MockMultipartFile(
                        "blobs",
                        "file1.txt",
                        "text/plain",
                        "File 1 content".getBytes()
                )
        ));

        mockSecurityAsClient();
        milestone = milestoneService.confirmWork(milestone);

        // MILESTONE ID=3
        mockSecurityAsFreelancer();
        milestone = milestoneService.submitWork(milestone, List.of(
                new MockMultipartFile(
                        "blobs",
                        "file2.txt",
                        "text/plain",
                        "File 2 content".getBytes()
                )
        ));


        mockSecurityAsClient();
        String response = mockMvc.perform(post("/api/v1/milestones/" + milestone.getMilestoneId() + "/confirm-work")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        var dto = objectMapper.readValue(response, MilestoneDto.class);
        assertThat(dto.getStatus()).isEqualTo(MilestoneStatusDto.FINISHED);
        assertThat(dto.getFundStatus()).isEqualTo(MilestoneFundStatusDto.RELEASED);

        project = projectRepos.findById(project.getProjectId()).orElseThrow();
        assertThat(project.getActiveMilestone()).isNull();
        assertThat(project.getStatus()).isEqualTo(Project.ProjectStatus.FINISHED);
    }

}
