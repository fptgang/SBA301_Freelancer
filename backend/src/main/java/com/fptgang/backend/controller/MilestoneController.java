package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.MilestonesApi;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.mapper.DetailLevel;
import com.fptgang.backend.mapper.MilestoneMapper;
import com.fptgang.backend.service.MilestoneService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1")
public class MilestoneController implements MilestonesApi {

    private final MilestoneMapper milestoneMapper;
    private final MilestoneService milestoneService;

    public MilestoneController(MilestoneMapper milestoneMapper,
                               MilestoneService milestoneService) {
        this.milestoneMapper = milestoneMapper;
        this.milestoneService = milestoneService;
    }

    /**
     * Can access: Freelancer
     */
    @Override
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MilestoneDto> submitMilestoneWork(Long milestoneId, List<MultipartFile> blobs) {
        return ResponseEntity.ok(
                milestoneMapper.toDTO(
                        milestoneService.submitWork(milestoneService.findById(milestoneId), blobs),
                        DetailLevel.FULL
                )
        );
    }

    /**
     * Can access: Client
     */
    @Override
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MilestoneDto> confirmMilestoneWork(Long milestoneId) {
        return ResponseEntity.ok(
                milestoneMapper.toDTO(
                        milestoneService.confirmWork(milestoneService.findById(milestoneId)),
                        DetailLevel.FULL
                )
        );
    }

    /**
     * Can access: Client
     */
    @Override
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MilestoneDto> depositMilestoneFund(Long milestoneId) {
        return ResponseEntity.ok(
                milestoneMapper.toDTO(
                        milestoneService.depositFund(milestoneService.findById(milestoneId)),
                        DetailLevel.FULL
                )
        );
    }
}
