package com.fptgang.backend.model;

import com.fptgang.backend.util.Searchable;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.jetbrains.annotations.NotNull;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "project_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long projectCategoryId;

    @Column(columnDefinition = "NVARCHAR(255)", length = 255, nullable = false)
    @Searchable
    private String name;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT TRUE")
    @Builder.Default
    private Boolean isVisible = true;

//    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
//    @Builder.Default
//    @ToString.Exclude
//    @EqualsAndHashCode.Exclude
//    private List<Project> projects = new ArrayList<>();
}