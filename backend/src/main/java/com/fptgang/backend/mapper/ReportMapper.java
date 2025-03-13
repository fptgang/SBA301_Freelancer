package com.fptgang.backend.mapper;

import com.fptgang.backend.api.model.ReportDto;
import com.fptgang.backend.model.Report;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.repository.ProjectRepos;
import com.fptgang.backend.util.DateTimeUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ReportMapper extends BaseMapper<ReportDto, Report> {
    private final AccountRepos accountRepos;
    private final AccountMapper accountMapper;
    private final ProjectRepos projectRepos;
    private final ProjectMapper projectMapper;

    public ReportMapper(AccountRepos accountRepos,
                        AccountMapper accountMapper,
                        ProjectRepos projectRepos,
                        ProjectMapper projectMapper) {
        this.accountRepos = accountRepos;
        this.accountMapper = accountMapper;
        this.projectRepos = projectRepos;
        this.projectMapper = projectMapper;
    }

    @Override
    public Report toEntity(ReportDto dto) {
        if (dto == null) {
            return null;
        }

        Report entity = new Report();
        entity.setReportId(dto.getReportId());

        if (dto.getReporter() != null && dto.getReporter().getAccountId() != null) {
            entity.setReporter(accountRepos.getReferenceById(dto.getReporter().getAccountId()));
        }
        if (dto.getProjectId() != null) {
            entity.setProject(projectRepos.getReferenceById(dto.getProjectId()));
        }
        entity.setReason(dto.getReason());

        if (dto.getStatus() != null) {
            entity.setStatus(Report.ReportStatus.valueOf(dto.getStatus().name()));
        }

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

        if (level == DetailLevel.REFERENCE) {
            return dto; // those fields are enough
        }

        dto.setReporter(accountMapper.toDTO(entity.getReporter(), DetailLevel.REFERENCE));
        dto.setProjectId(entity.getProject().getProjectId());
        dto.setReason(entity.getReason());
        dto.setStatus(ReportDto.StatusEnum.valueOf(entity.getStatus().name()));
        dto.setCreatedAt(DateTimeUtil.fromLocalToOffset(entity.getCreatedAt()));
        dto.setUpdatedAt(DateTimeUtil.fromLocalToOffset(entity.getUpdatedAt()));

        return dto;
    }
}