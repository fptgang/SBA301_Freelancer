package com.fptgang.backend.repository;

import com.fptgang.backend.model.Proposal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface ProposalRepos extends JpaRepository<Proposal,Long> {
    Optional<Proposal> findByProposalId(Long proposalId);
}
