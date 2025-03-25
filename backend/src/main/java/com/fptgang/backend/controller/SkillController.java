package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.SkillsApi;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.mapper.DetailLevel;
import com.fptgang.backend.mapper.SkillMapper;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.service.SkillService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.OpenApiHelper;
import com.fptgang.backend.util.SecurityUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1")
public class SkillController implements SkillsApi {
    private final SkillMapper skillMapper;
    private final SkillService skillService;

    public SkillController(SkillMapper skillMapper, SkillService skillService) {
        this.skillMapper = skillMapper;
        this.skillService = skillService;
    }

    /**
     * Can access: Staff+
     */
    @Override
    public ResponseEntity<SkillDto> createSkill(SkillDto skillDto) {
        if(!SecurityUtil.hasRole(Role.ADMIN, Role.STAFF)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        var skill = skillMapper.toEntity(skillDto);
        return new ResponseEntity<>(skillMapper.toDTO(skillService.create(skill), DetailLevel.FULL), HttpStatus.OK);
    }

    /**
     * Can access: Staff+
     */
    @Override
    public ResponseEntity<Void> deleteSkill(Long skillId) {
        if(!SecurityUtil.hasRole(Role.ADMIN, Role.STAFF)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        skillService.deleteById(skillId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<SkillDto> getSkillById(Long skillId) {
        return new ResponseEntity<>(skillMapper.toDTO(skillService.findBySkillId(skillId),DetailLevel.FULL), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<GetSkills200Response> getSkills(Pageable pageable, String filter, String search) {
        var page = OpenApiHelper.toPageable(pageable);
        var includeInvisible = SecurityUtil.hasPermission(Role.ADMIN);
        var params = ListParams.builder()
                .pageable(page)
                .search(search)
                .filter(filter)
                .includeInvisible(includeInvisible);
        var res = skillService
                .getAll(params.build())
                .map(skill -> skillMapper.toDTO(skill, DetailLevel.REFERENCE));
        return OpenApiHelper.respondPage(res, GetSkills200Response.class);
    }

    /**
     * Can access: Staff+
     */
    @Override
    public ResponseEntity<SkillDto> updateSkill(Long skillId, SkillDto skillDto) {
        if(!SecurityUtil.hasRole(Role.ADMIN, Role.STAFF)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        skillDto.setSkillId(skillId); // Override skillId

        return new ResponseEntity<>(
                skillMapper.toDTO(
                        skillService.update(skillMapper.toEntity(skillDto)),
                        DetailLevel.FULL
                ),
                HttpStatus.OK
        );
    }
}
