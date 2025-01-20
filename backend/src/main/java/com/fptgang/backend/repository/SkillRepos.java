package com.fptgang.backend.repository;

import com.fptgang.backend.model.Skill;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SkillRepos extends JpaRepository<Skill, Long>, JpaSpecificationExecutor<Skill> {
    Optional<Skill> findBySkillId(Long skillId);
    @Query("SELECT a FROM Skill a WHERE a.isVisible = true")
    Page<Skill> findAllByVisibleTrue(Pageable pageable, Specification<Skill> spec);
}
