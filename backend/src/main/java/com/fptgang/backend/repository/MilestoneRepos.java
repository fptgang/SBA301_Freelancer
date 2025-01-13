package com.fptgang.backend.repository;

import com.fptgang.backend.model.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface MilestoneRepos extends JpaRepository<Milestone,Long> {
    Optional<Milestone> findByMilestoneId(Long milestoneId);
}
