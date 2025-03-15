package com.fptgang.backend.model;

import com.fptgang.backend.util.Searchable;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.jetbrains.annotations.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "milestones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Milestone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long milestoneId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(columnDefinition = "NVARCHAR(255)", length = 255, nullable = false)
    @Searchable
    private String title;

    @Column(columnDefinition = "TEXT", length = 10000000)
    @Searchable
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    @DecimalMin("0.0")
    @DecimalMax("1.0")
    private BigDecimal budgetRatio;

    @Column(nullable = false)
    private LocalDateTime deadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MilestoneStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FundStatus fundStatus;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    @Builder.Default
    private Boolean isVisible = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "milestone", fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<File> deliverables = new ArrayList<>();

    // A milestone can have up to 2 transactions
    @OneToMany(mappedBy = "milestone", cascade = CascadeType.ALL)
    @Builder.Default
    @ToString.Exclude
    private List<Transaction> transactions = new ArrayList<>();

    public enum MilestoneStatus {
        PENDING,
        TERMINATED,
        IN_PROGRESS,
        REVIEWING,
        FINISHED;

        public boolean canBeTerminated() {
            return this == PENDING || this == IN_PROGRESS || this == REVIEWING;
        }
    }

    public enum FundStatus {
        NONE,
        DEPOSITED,
        RELEASED,
        REFUNDED
    }
}
