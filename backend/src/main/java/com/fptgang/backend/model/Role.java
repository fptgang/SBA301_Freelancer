package com.fptgang.backend.model;

import jakarta.validation.constraints.NotNull;

public enum Role {
    ADMIN,
    STAFF,
    CLIENT,
    FREELANCER;

    @NotNull
    public boolean hasPermission(Role perm) {
        return switch (this) {
            case ADMIN -> true;
            case STAFF -> this == perm || perm == Role.CLIENT || perm == Role.FREELANCER;
            default -> this == perm;
        };
    }
}
