package com.fptgang.backend.repository;

import com.fptgang.backend.model.Profile;
import com.fptgang.backend.model.ProfileSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface ProfileSkillRepos extends JpaRepository<ProfileSkill,Long>, JpaSpecificationExecutor<ProfileSkill> {
    Optional<ProfileSkill> findByProfileSkillId(Long profileSkillId);
}
