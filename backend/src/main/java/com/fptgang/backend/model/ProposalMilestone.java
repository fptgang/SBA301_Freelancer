package com.fptgang.backend.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "proposal_milestones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProposalMilestone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long milestoneId;

    @ManyToOne
    @JoinColumn(name = "proposal_id")
    private Proposal proposal;
    @Column(columnDefinition = "NVARCHAR(255)", length = 255, nullable = false)
    private String title;
    private BigDecimal budgetRatio;
    private LocalDateTime deadline;

    @Enumerated(EnumType.STRING)
    private MilestoneStatus status;
    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum MilestoneStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}

