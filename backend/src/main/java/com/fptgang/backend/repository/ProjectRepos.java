package com.fptgang.backend.repository;

import com.fptgang.backend.model.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
@Repository
public interface ProjectRepos extends JpaRepository<Project,Long>, JpaSpecificationExecutor<Project> {
    Optional<Project> findByProjectId(Long projectId);
    @Query("SELECT p FROM Project p LEFT JOIN p.messages m " +
            "WHERE (p.isVisible=true OR NOT p.isVisible  = :includeInvisible) " +
            "AND (p.contract.freelancer.accountId" +
            " = :participantId OR p.client.accountId = :participantId) " +
            "OR p.staff.accountId=:participantId " +
            "GROUP BY p.projectId " +
            "ORDER BY MAX(m.createdAt) DESC")
    Page<Project> findAllSortedByLatestMessage (Pageable pageable,boolean includeInvisible,Long participantId);

    List<Project> findByStatusAndStartDateLessThanEqual(Project.ProjectStatus status, LocalDateTime date);
    List<Project> findByStatusAndToTerminate(Project.ProjectStatus status, Boolean toTerminate);

    Long countByStatusAndClient_AccountId(Project.ProjectStatus status, Long clientAccountId);

    Long countAllByCategory_ProjectCategoryId(Long categoryProjectCategoryId);

    Long countAllByCategory_ProjectCategoryIdAndStatus(Long categoryProjectCategoryId, Project.ProjectStatus status);

}
