package com.fptgang.backend.repository;

import com.fptgang.backend.model.Project;
import com.fptgang.backend.model.Proposal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface ProposalRepos extends JpaRepository<Proposal, Long>, JpaSpecificationExecutor<Proposal> {
    Optional<Proposal> findByProposalId(Long proposalId);
    List<Proposal> findByProjectAndStatus(Project project, Proposal.ProposalStatus status);
    List<Proposal> findByProject_ProjectId(Long projectId);
    Optional<Proposal> findByProject_ProjectIdAndFreelancer_AccountIdAndStatus(Long projectId, Long freelancerId, Proposal.ProposalStatus status);

    @Query("""
        SELECT COUNT(p) FROM Proposal p
        WHERE p.project.projectId = :projectId
        AND (:status IS NULL OR p.status = :status)
    """)
    long countByProjectIdAndStatus(@Param("projectId") Long projectId,
                                   @Param("status") Proposal.ProposalStatus status);
}
