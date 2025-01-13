package com.fptgang.backend.service.impl;

import com.fptgang.backend.model.Proposal;
import com.fptgang.backend.repository.ProposalRepos;
import com.fptgang.backend.service.ProposalService;
import com.fptgang.backend.util.OpenApiHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ProposalServiceImpl implements ProposalService {

    @Autowired
    private ProposalRepos proposalRepos;


    @Override
    public void update(Proposal proposal) {
        proposalRepos.save(proposal);
    }

    @Override
    public Proposal findById(long id) {
        return proposalRepos.findById(id).orElse(null);
    }

    @Override
    public void deleteById(long id) {
        proposalRepos.deleteById(id);
    }

    @Override
    public Page<Proposal> getAll(Pageable pageable, String filter) {
        var spec = OpenApiHelper.<Proposal>toSpecification(filter);
        return proposalRepos.findAll(spec, pageable);
    }
}
