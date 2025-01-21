package com.fptgang.backend.service;

import com.fptgang.backend.model.Skill;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SkillService {

    Skill create(Skill skill);
    Skill update(Skill account);
    Skill findBySkillId(long skillId);
    void deleteById(long skillId);
    Page<Skill> getAll(Pageable pageable, String filter, String search, boolean includeInvisible);
    default Page<Skill> getAll(Pageable pageable, String filter, String search) {
        return getAll(pageable, filter, search, false);
    }
    default Page<Skill> getAll(Pageable pageable, String filter) {
        return getAll(pageable, filter, null, false);
    }
}
