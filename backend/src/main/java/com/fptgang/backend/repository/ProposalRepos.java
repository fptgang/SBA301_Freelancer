package com.fptgang.backend.repository;

import com.fptgang.backend.model.Proposal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface ProposalRepos extends JpaRepository<Proposal, Long>, JpaSpecificationExecutor<Proposal> {
    Optional<Proposal> findByProposalId(Long proposalId);
    @Query("SELECT a FROM Proposal a WHERE a.isVisible = true")
    Page<Proposal> findAllByVisibleTrue(Pageable pageable, Specification<Proposal> spec);
}
