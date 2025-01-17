package com.fptgang.backend.repository;

import com.fptgang.backend.model.ProfileSkill;
import com.fptgang.backend.model.ProjectSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface ProjectSkillRepos extends JpaRepository<ProjectSkill,Long>, JpaSpecificationExecutor<ProjectSkill> {
}
