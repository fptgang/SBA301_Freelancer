package com.fptgang.backend.service;

import com.fptgang.backend.model.Skill;
import com.fptgang.backend.service.params.ListParams;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SkillService {

    Skill create(Skill skill);
    Skill update(Skill account);
    Skill findBySkillId(long skillId);
    void deleteById(long skillId);
    Page<Skill> getAll(ListParams params);
}
