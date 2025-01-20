package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.SkillsApi;
import com.fptgang.backend.api.model.GetAccountsPageableParameter;
import com.fptgang.backend.api.model.GetSkills200Response;
import com.fptgang.backend.api.model.SkillDto;
import com.fptgang.backend.mapper.SkillMapper;
import com.fptgang.backend.service.SkillService;
import com.fptgang.backend.util.OpenApiHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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


    @Override
    public ResponseEntity<SkillDto> createSkill(SkillDto skillDto) {
        var skill = skillMapper.toEntity(skillDto);
        return new ResponseEntity<>(skillMapper.toDTO(skillService.create(skill)), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<Void> deleteSkill(Integer skillId) {
        skillService.deleteById(skillId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<SkillDto> getSkillById(Integer skillId) {
        return new ResponseEntity<>(skillMapper.toDTO(skillService.findBySkillId(skillId)), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<GetSkills200Response> getSkills(GetAccountsPageableParameter pageable, String filter) {
        log.info("Getting skill");
        var page = OpenApiHelper.toPageable(pageable);
        var res = skillService.getAll(page, filter).map(skillMapper::toDTO);
        return OpenApiHelper.respondPage(res, GetSkills200Response.class);
    }

    @Override
    public ResponseEntity<SkillDto> updateSkill(Integer skillId, SkillDto skillDto) {
        return new ResponseEntity<>(skillMapper.toDTO(skillService.update(skillMapper.toEntity(skillDto))), HttpStatus.OK);
    }
}
