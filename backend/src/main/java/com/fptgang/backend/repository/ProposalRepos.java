package com.fptgang.backend.repository;

import com.fptgang.model.Proposal;
import com.fptgang.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProposalRepos extends JpaRepository<Proposal,Long> {
    Optional<Proposal> findByProposalId(Long proposalId);
}
