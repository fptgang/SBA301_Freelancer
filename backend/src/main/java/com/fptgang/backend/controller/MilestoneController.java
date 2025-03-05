package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.MilestonesApi;
import com.fptgang.backend.api.model.*;
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

    public MilestoneController(MilestoneMapper milestoneMapper, MilestoneService milestoneService) {
        this.milestoneMapper = milestoneMapper;
        this.milestoneService = milestoneService;
    }

    @Override
    public ResponseEntity<MilestoneDto> createMilestone(MilestoneDto milestoneDto) {
        var milestone = milestoneMapper.toEntity(milestoneDto);
        return new ResponseEntity<>(milestoneMapper.toDTO(milestoneService.create(milestone)), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Void> deleteMilestone(Long milestoneId) {
        milestoneService.deleteById(milestoneId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<MilestoneDto> getMilestoneById(Long milestoneId) {
        return new ResponseEntity<>(milestoneMapper.toDTO(milestoneService.findById(milestoneId)), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<GetMilestones200Response> getMilestones(Pageable pageable, String filter, String search) {
        log.info("Getting milestone");
        var includeInvisible = SecurityUtil.hasPermission(Role.ADMIN);
        var params = ListParams.builder()
                .pageable(OpenApiHelper.toPageable(pageable))
                .search(search)
                .filter(filter)
                .includeInvisible(includeInvisible);
        var res = milestoneService
                .getAll(params.build())
                .map(milestoneMapper::toDTO);
        return OpenApiHelper.respondPage(res, GetMilestones200Response.class);
    }

    @Override
    public ResponseEntity<MilestoneDto> updateMilestone(Long milestoneId, MilestoneDto milestoneDto) {
        milestoneDto.setMilestoneId(milestoneId); // Override milestoneId

        return new ResponseEntity<>(milestoneMapper.toDTO(milestoneService.update(milestoneMapper.toEntity(milestoneDto))), HttpStatus.OK);
    }
}
