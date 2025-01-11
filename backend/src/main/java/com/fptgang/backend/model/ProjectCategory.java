package com.fptgang.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "project_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long projectCategoryId;

    @Column(columnDefinition = "NVARCHAR(255)", length = 255, nullable = false)
    private String name;
    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    private boolean isVisible;

    @OneToMany(mappedBy = "category")
    private Set<Project> projects = new HashSet<>();
}