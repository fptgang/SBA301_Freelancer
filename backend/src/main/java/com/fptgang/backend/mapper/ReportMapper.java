package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ReportDto;
import com.fptgang.backend.model.Report;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.ReportRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.repository.ProposalRepos;
import com.fptgang.backend.util.DateTimeUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ReportMapper extends BaseMapper<ReportDto, Report> {
    private final ReportRepos reportRepos;
    private final ProjectRepos projectRepos;
    private final AccountRepos accountRepos;
    private final ProposalRepos proposalRepos;

    public ReportMapper(ReportRepos reportRepos, ProjectRepos projectRepos, AccountRepos accountRepos, ProposalRepos proposalRepos) {
        this.reportRepos = reportRepos;
        this.projectRepos = projectRepos;
        this.accountRepos = accountRepos;
        this.proposalRepos = proposalRepos;
    }

    @Override
    public Report toEntity(ReportDto dto) {
        if (dto == null) {
            return null;
        }

        Report entity = new Report();
        entity.setReportId(dto.getReportId());

        if (dto.getProjectId() != null) {
            entity.setProject(projectRepos.findByProjectId(dto.getProjectId())
                    .orElseThrow(() -> new IllegalArgumentException("Project not found")));
        }

        if (dto.getReporterId() != null) {
            entity.setReporter(accountRepos.findByAccountId(dto.getReporterId())
                    .orElseThrow(() -> new IllegalArgumentException("Reporter not found")));
        }

        if(dto.getStatus() != null){
            entity.setStatus(Report.ReportStatus.valueOf(dto.getStatus().name()));
        }

        entity.setReason(dto.getReason());

        entity.setCreatedAt(DateTimeUtil.fromOffsetToLocal(dto.getCreatedAt()));
        entity.setUpdatedAt(DateTimeUtil.fromOffsetToLocal(dto.getUpdatedAt()));

        return entity;
    }

    @Override
    public ReportDto toDTO(Report entity, DetailLevel level) {
        if (entity == null) {
            return null;
        }

        ReportDto dto = new ReportDto();
        dto.setReportId(entity.getReportId());
        dto.setProjectId(entity.getProject().getProjectId());
        dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));
        dto.setUpdatedAt(DateTimeUtil.fromLocalToOffset(entity.getUpdatedAt()));

        if (level == DetailLevel.REFERENCE) {
            return dto; // those fields are enough
        }

        dto.setReporterId(entity.getReporter().getAccountId());

        if (level == DetailLevel.SUMMARY) {
            return dto; // those fields are enough
        }

        dto.setReason(entity.getReason());
        dto.setStatus(ReportDto.StatusEnum.valueOf(entity.getStatus().name()));

        // Add more fields if needed for other detail levels

        return dto;
    }
}