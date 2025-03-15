package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.MilestonesApi;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.mapper.DetailLevel;
import com.fptgang.backend.mapper.MilestoneCreateMapper;
import com.fptgang.backend.mapper.MilestoneMapper;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.service.MilestoneService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.OpenApiHelper;
import com.fptgang.backend.util.SecurityUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1")
public class MilestoneController implements MilestonesApi {

    private final MilestoneMapper milestoneMapper;
    private final MilestoneService milestoneService;
    private final MilestoneCreateMapper milestoneCreateMapper;

    public MilestoneController(MilestoneMapper milestoneMapper,
                               MilestoneService milestoneService,
                               MilestoneCreateMapper milestoneCreateMapper) {
        this.milestoneMapper = milestoneMapper;
        this.milestoneService = milestoneService;
        this.milestoneCreateMapper = milestoneCreateMapper;
    }

    @Override
    public ResponseEntity<MilestoneDto> submitMilestoneWork(Long milestoneId) {
        return MilestonesApi.super.submitMilestoneWork(milestoneId);
    }

    @Override
    public ResponseEntity<MilestoneDto> confirmMilestoneWork(Long milestoneId) {
        return MilestonesApi.super.confirmMilestoneWork(milestoneId);
    }

    @Override
    public ResponseEntity<MilestoneDto> depositMilestoneFund(Long milestoneId) {
        return MilestonesApi.super.depositMilestoneFund(milestoneId);
    }
}
