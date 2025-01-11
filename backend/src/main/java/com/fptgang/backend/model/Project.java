package com.fptgang.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
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

    @Column(columnDefinition = "NVARCHAR(255)", length = 255, nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", length = 10000000, nullable = false)
    private String description;

    private BigDecimal minEstimatedBudget;
    private BigDecimal maxEstimatedBudget;
    private LocalDateTime estimatedDeadline;

    @Enumerated(EnumType.STRING)
    private ProjectStatus status;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private boolean isVisible;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<File> files = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Proposal> proposals = new ArrayList<>();

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "active_proposal_id", unique = true)
    private Proposal activeProposal;

    public enum ProjectStatus {
        OPEN, IN_PROGRESS, TERMINATED, FINISHED
    }
}