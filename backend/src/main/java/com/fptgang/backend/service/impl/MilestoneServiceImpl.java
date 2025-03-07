package com.fptgang.backend.service.impl;

import com.fptgang.backend.model.Milestone;
import com.fptgang.backend.repository.MilestoneRepos;
import com.fptgang.backend.service.MilestoneService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.EntityUtil;
import com.fptgang.backend.util.OpenApiHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class MilestoneServiceImpl implements MilestoneService {

    @Autowired
    private MilestoneRepos proposalRepos;


    @Override
    public Milestone create(Milestone milestone) {
        milestone.setMilestoneId(null);
        return proposalRepos.save(milestone);
    }

    @Override
    public Milestone update(Milestone milestone) {
        if(milestone.getMilestoneId() == null){
            throw new IllegalArgumentException("Milestone does not exist");
        }
        var existing = proposalRepos.findById(milestone.getMilestoneId()).orElse(null);
        EntityUtil.merge(existing, milestone);
        return proposalRepos.save(milestone);
    }

    @Override
    public Milestone findById(long id) {
        return proposalRepos.findById(id).orElse(null);
    }

    @Override
    public Milestone deleteById(long id) {
        var milestone = proposalRepos.findById(id).orElseThrow(() -> new IllegalArgumentException("Account does not exist"));
        milestone.setIsVisible(false);
        return proposalRepos.save(milestone);
    }

    @Override
    public Page<Milestone> getAll(ListParams params) {
        var spec = OpenApiHelper.groupBy( params.<Milestone>toSpec(), "milestoneId");
        return proposalRepos.findAll(spec, params.getPageable());
    }
}
