package com.fptgang.backend.service.impl;

import com.fptgang.backend.model.Milestone;
import com.fptgang.backend.repository.MilestoneRepos;
import com.fptgang.backend.service.MilestoneService;
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
    public Milestone update(Milestone milestone) {
        return proposalRepos.save(milestone);
    }

    @Override
    public Milestone findById(long id) {
        return proposalRepos.findById(id).orElse(null);
    }

    @Override
    public Milestone deleteById(long id) {
        var milestone = proposalRepos.findById(id).orElseThrow(() -> new IllegalArgumentException("Account does not exist"));
        milestone.setVisible(false);
        return proposalRepos.save(milestone);
    }

    @Override
    public Page<Milestone> getAll(Pageable pageable, String filter) {
        var spec = OpenApiHelper.<Milestone>toSpecification(filter);
        return proposalRepos.findAll(spec, pageable);
    }
}
