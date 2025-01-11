package com.fptgang.backend.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "files")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class File {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long fileId;

    @Column(columnDefinition = "NVARCHAR(255)", length = 255, nullable = false)
    private String fileName;
    @Column(columnDefinition = "NVARCHAR(255)", length = 255, nullable = false)
    private String fileUrl;
    private String fileType;
    private Long size;
    @CreationTimestamp
    private LocalDateTime createdAt;
    private boolean isVisible;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploader_id")
    private Account uploader;

    @ManyToOne()
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne()
    @JoinColumn(name = "message_id")
    private Message message;

    @ManyToOne()
    @JoinColumn(name = "proposal_id")
    private Proposal proposal;
}

