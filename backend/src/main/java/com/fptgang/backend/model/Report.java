package com.fptgang.backend.model;

import com.fptgang.backend.util.Searchable;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private Account reporter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(columnDefinition = "TEXT", length = 10000000, nullable = false)
    @Searchable
    private String reason;

    @Column(columnDefinition = "TEXT", length = 10000000)
    @Searchable
    private String solution;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus status;

    public enum ReportStatus {
        UNSOLVED,
        SOLVED,
        SOLVING
    }

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Nullable
    public Account getFreelancer() {
        if (getProject().getContract() == null)
            return null;
        return getProject().getContract().getFreelancer();
    }

    @NotNull
    public Account requireFreelancer() {
        if (getProject().getContract() == null)
            throw new IllegalStateException("Contract does not exist");
        return getProject().getContract().getFreelancer();
    }
}
