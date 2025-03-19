package com.fptgang.backend.model;

import com.fptgang.backend.util.Searchable;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

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
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
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
    @EqualsAndHashCode.Exclude
    private List<File> deliverables = new ArrayList<>();

    // A milestone can have up to 2 transactions
    @OneToMany(mappedBy = "milestone", cascade = CascadeType.ALL)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
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

    @Nullable
    public Account getFreelancer() {
        return getProject().getFreelancer();
    }

    @NotNull
    public Account requireFreelancer() {
        var freelancer = getProject().getFreelancer();
        if (freelancer == null)
            throw new IllegalStateException("Contract does not exist");
        return freelancer;
    }

    @Nullable
    public BigDecimal getContractualBudget() {
        if (getProject().getContract() == null)
            return null;
        return getProject().getContract().getBudget().multiply(budgetRatio);
    }

    @NotNull
    public BigDecimal requireContractualBudget() {
        if (getProject().getContract() == null)
            throw new IllegalStateException("Contract does not exist");
        return getProject().getContract().getBudget().multiply(budgetRatio);
    }

    @Nullable
    public Milestone getNextVisibleMilestone() {
        List<Milestone> visibleMilestones = getProject().getMilestones().stream()
                .filter(Milestone::getIsVisible)
                .toList();

        for (int i = 0; i < visibleMilestones.size() - 1; i++) {
            if (visibleMilestones.get(i).getMilestoneId().equals(getMilestoneId())) {
                return visibleMilestones.get(i + 1);
            }
        }

        return null;
    }

    @Nullable
    public Milestone getPrevVisibleMilestone() {
        List<Milestone> visibleMilestones = getProject().getMilestones().stream()
                .filter(Milestone::getIsVisible)
                .toList();

        for (int i = 1; i < visibleMilestones.size(); i++) {
            if (visibleMilestones.get(i).getMilestoneId().equals(getMilestoneId())) {
                return visibleMilestones.get(i - 1);
            }
        }

        return null;
    }

}
