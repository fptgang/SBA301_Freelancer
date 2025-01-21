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
    public Proposal create(Proposal proposal) {
        return proposalRepos.save(proposal);
    }

    @Override
    public Proposal update(Proposal proposal) {
        if (proposal.getProposalId() == null || proposalRepos.findByProposalId(proposal.getProposalId()).isEmpty()) {
            throw new IllegalArgumentException("Proposal does not exist");
        }
        return proposalRepos.save(proposal);
    }

    @Override
    public Proposal findById(long id) {
        return proposalRepos.findById(id).orElseThrow(
                () -> new IllegalArgumentException("Proposal does not exist")
        );
    }

    @Override
    public Proposal deleteById(long id) {
        Proposal proposal = findById(
                id
        );
        proposal.setVisible(false);
        return proposalRepos.save(proposal);
    }

    @Override
    public Page<Proposal> getAll(Pageable pageable, String filter, String search, boolean includeInvisible) {
        var spec = OpenApiHelper.<Proposal>filterToSpec(filter);
        spec = spec.and(OpenApiHelper.searchToSpec(search));
        if (!includeInvisible) {
            spec = spec.and((a, _, cb) -> cb.isTrue(a.get("isVisible")));
        }
        return proposalRepos.findAll(spec, pageable);
    }
}
