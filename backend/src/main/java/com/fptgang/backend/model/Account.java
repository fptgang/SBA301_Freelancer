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
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long accountId;

    @Column(unique = true)
    private String email;

    @Column(nullable = false, columnDefinition = "NVARCHAR(255)")
    private String firstName;

    @Column(nullable = false, columnDefinition = "NVARCHAR(255)")
    private String lastName;

    @Column
    private String password;

    @Column
    private String avatarUrl;

    @Column
    private BigDecimal balance;

    @OneToMany(mappedBy = "fromAccount", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Transaction> outgoingTransactions = new ArrayList<>();

    @OneToMany(mappedBy = "toAccount", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Transaction> incomingTransactions = new ArrayList<>();

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Role role;

    private boolean isVerified;
    private LocalDateTime verifiedAt;
    private boolean isVisible;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

}
