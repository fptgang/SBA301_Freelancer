package com.fptgang.backend.model;

import com.fptgang.backend.util.Searchable;
import jakarta.annotation.Nullable;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.jetbrains.annotations.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long projectId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_category_id", nullable = false)
    private ProjectCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Account client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private Account staff;

    @Column(columnDefinition = "NVARCHAR(255)", length = 255, nullable = false)
    @Searchable
    private String title;

    @Column(columnDefinition = "TEXT", length = 100_000, nullable = false)
    @Searchable
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectStatus status;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal minBudget;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal maxBudget;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    @Builder.Default
    private Boolean isVisible = true;

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<File> files = new ArrayList<>();

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OrderBy("proposalId ASC")
    private List<Proposal> proposals = new ArrayList<>();

    @OneToOne(mappedBy = "project", fetch = FetchType.EAGER)
    @Nullable
    private Contract contract;

    // Cascading milestones with project
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OrderBy("milestoneId ASC")
    private List<Milestone> milestones = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "active_milestone_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Nullable
    private Milestone activeMilestone;

    // Cascading project skills with project
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    private List<ProjectSkill> requiredSkills = new ArrayList<>();

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OrderBy("messageId ASC")
    private List<Message> messages = new ArrayList<>();

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OrderBy("reportId ASC")
    private List<Report> reports = new ArrayList<>();

    public enum ProjectStatus {
        OPEN,
        PAUSED,
        IN_PROGRESS,
        TERMINATED,
        FINISHED
    }

    @Enumerated(EnumType.STRING)
    @Nullable
    private TerminationReason terminationReason;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    @Builder.Default
    private Boolean toTerminate = false;

    public enum TerminationReason {
        /**
            Other reasons before the contract is made
            e.g. Client didn’t accept any proposal by startDate
                 No proposals were submitted by startDate
         */
        OTHER,

        /** Contract remained unsigned by the start date */
        CONTRACT_UNSIGNED,

        /** Client can request termination before 2 days past the current milestone deadline
            Become effective starting from the next milestone  */
        CLIENT_REQUEST_TERMINATION,

        /** Project terminated by staff after conflict resolution */
        STAFF_DECISION
    }

    @Nullable
    public Account getFreelancer() {
        return getContract() == null ? null : getContract().getFreelancer();
    }
}