package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.ReportsApi;
import com.fptgang.backend.api.model.ReportDto;
import com.fptgang.backend.api.model.GetReports200Response;
import com.fptgang.backend.api.model.Pageable;
import com.fptgang.backend.mapper.ReportMapper;
import com.fptgang.backend.mapper.DetailLevel;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.service.ReportService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.OpenApiHelper;
import com.fptgang.backend.util.SecurityUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@Slf4j
public class ReportController implements ReportsApi {
    private final ReportService reportService;
    private final ReportMapper reportMapper;

    @Autowired
    public ReportController(ReportService reportService, ReportMapper reportMapper) {
        this.reportService = reportService;
        this.reportMapper = reportMapper;
    }

    @Override
    public ResponseEntity<ReportDto> createReport(ReportDto reportDto) {
        var report = reportMapper.toEntity(reportDto);
        return new ResponseEntity<>(reportMapper.toDTO(reportService.create(report), DetailLevel.FULL), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<ReportDto> getReportById(Long reportId) {

        return new ResponseEntity<>(reportMapper.toDTO(reportService.findById(reportId),DetailLevel.FULL), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<GetReports200Response> getReports(Pageable pageable, String filter, String search) {

        var params = ListParams.builder()
                .pageable(OpenApiHelper.toPageable(pageable))
                .search(search)
                .filter(filter);
        DetailLevel detailLevel;
        if( SecurityUtil.hasPermission(Role.ADMIN)|| SecurityUtil.hasPermission(Role.STAFF)){
            detailLevel=DetailLevel.FULL;
        } else {
            detailLevel = DetailLevel.SUMMARY;
        }
        var res = reportService
                .getAll(params.build())
                .map(report -> reportMapper.toDTO(report, detailLevel));
        return OpenApiHelper.respondPage(res, GetReports200Response.class);
    }

}
