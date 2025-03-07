package com.fptgang.backend.service.impl;

import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.Skill;
import com.fptgang.backend.repository.SkillRepos;
import com.fptgang.backend.service.SkillService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.EntityUtil;
import com.fptgang.backend.util.OpenApiHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class SkillServiceImpl implements SkillService {
    private final SkillRepos skillRepos;

    @Autowired
    public SkillServiceImpl(SkillRepos skillRepos) {
        this.skillRepos = skillRepos;
    }


    @Override
    public Skill create(Skill skill) {
        skill.setSkillId(null);
        return skillRepos.save(skill);
    }

    @Override
    public Skill update(Skill skill) {
        if(skill.getSkillId() == null){
            throw new InvalidInputException("skill does not exist");
        }
        var existing = skillRepos.findBySkillId(skill.getSkillId()).orElseThrow(
                ()-> new InvalidInputException("skill does not exist"));
        EntityUtil.merge(existing, skill);

        return skillRepos.save(skill);
    }

    @Override
    public Skill findBySkillId(long skillId) {
        Skill skill = skillRepos.findBySkillId(skillId).orElseThrow(() -> new InvalidInputException("skill with project id " + skillId + "not found"));
        return skill;
    }

    @Override
    public void deleteById(long skillId) {
        Skill skill = skillRepos.findBySkillId(skillId).orElseThrow(() -> new InvalidInputException("skill with project id " + skillId + "not found"));
        skill.setIsVisible(false);
        skillRepos.save(skill);
    }

    @Override
    public Page<Skill> getAll(ListParams params) {
        var spec = OpenApiHelper.groupBy( params.<Skill>toSpec(), "skillId");
        return skillRepos.findAll(spec, params.getPageable());
    }
}
