package com.fptgang.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
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

    @ManyToOne
    @JoinColumn(name = "project_category_id")
    private ProjectCategory category;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private Account account;
    @Column(columnDefinition = "NVARCHAR(255)", length = 255, nullable = false)

    private String title;

    @Column(columnDefinition = "TEXT", length = 10000000, nullable = false)
    private String description;

    private BigDecimal minBudget;
    private BigDecimal maxBudget;

    @Enumerated(EnumType.STRING)
    private ProjectStatus status;
    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    private boolean isVisible;
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    private Set<Milestone> milestones = new HashSet<>();
    @OneToMany(mappedBy = "project")
    private Set<File> files = new HashSet<>();
    @OneToMany(mappedBy = "project")
    private Set<Proposal> proposals = new HashSet<>();

    public enum ProjectStatus {
        OPEN, CLOSED
    }
}