package com.fptgang.backend.service.impl;

import com.fptgang.backend.model.Proposal;
import com.fptgang.backend.repository.ProposalRepos;
import com.fptgang.backend.service.ProposalService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.EntityUtil;
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
    public Proposal create(Proposal proposal) {
        proposal.setProposalId(null);
        return proposalRepos.save(proposal);
    }

    @Override
    public Proposal update(Proposal proposal) {
        if (proposal.getProposalId() == null ) {
            throw new IllegalArgumentException("Proposal does not exist");
        }
        var existing = proposalRepos.findById(proposal.getProposalId()).orElseThrow(
                () -> new IllegalArgumentException("Proposal does not exist"));
        EntityUtil.merge(existing, proposal);
        return proposalRepos.save(proposal);
    }

    @Override
    public Proposal findById(long id) {
        return proposalRepos.findById(id).orElseThrow(
                () -> new IllegalArgumentException("Proposal does not exist")
        );
    }

    @Override
    public Page<Proposal> getAll(ListParams params) {
        var spec = OpenApiHelper.groupBy(params.<Proposal>toSpec(), "proposalId");
        return proposalRepos.findAll(spec, params.getPageable());
    }
}
