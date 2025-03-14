package com.fptgang.backend.repository;

import com.fptgang.backend.model.Milestone;
import com.fptgang.backend.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface MilestoneRepos extends JpaRepository<Milestone, Long>, JpaSpecificationExecutor<Milestone> {
    Optional<Milestone> findByMilestoneId(Long milestoneId);
    Optional<Milestone> findByProjectAndStatus(Project project, Milestone.MilestoneStatus status);
    
}
