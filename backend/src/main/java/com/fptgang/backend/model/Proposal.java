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
@Table(name = "proposals")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Proposal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long proposalId;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne
    @JoinColumn(name = "freelancer_id")
    private Account freelancer;

    private BigDecimal budget;
    private LocalDateTime deliveryTime;

    @Enumerated(EnumType.STRING)
    private ProposalStatus status;
    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    private boolean isVisible;
    @OneToMany(mappedBy = "proposal", cascade = CascadeType.ALL)
    private Set<ProposalMilestone> milestones = new HashSet<>();
    @OneToMany(mappedBy = "proposal", cascade = CascadeType.ALL)
    private Set<File> files = new HashSet<>();

    public enum ProposalStatus {
        PENDING,
        ACCEPTED,
        REJECTED
    }
}

