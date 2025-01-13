package com.fptgang.backend.repository;

import com.fptgang.model.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MilestoneRepos extends JpaRepository<Milestone,Long> {
    Optional<Milestone> findByMilestoneId(Long milestoneId);
}
