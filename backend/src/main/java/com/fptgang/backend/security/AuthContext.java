package com.fptgang.backend.security;

import com.fptgang.backend.model.Project;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.model.Skill;
import com.fptgang.backend.model.Transaction;
import org.jetbrains.annotations.NotNull;
import org.springframework.lang.Nullable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.InsufficientAuthenticationException;

public interface AuthContext {
    @Nullable Long getAccountId();
    default boolean matchAccountId(Long id) {
        var current = getAccountId();
        return current != null && current.equals(id);
    }
    @Nullable String getEmail();
    @Nullable Role getRole();
    default long requireAccountId() {
        var val = getAccountId();
        if (val == null)
            throw new InsufficientAuthenticationException("User is not authenticated");
        return val;
    }
    default @NotNull String requireEmail() {
        var val = getEmail();
        if (val == null)
            throw new InsufficientAuthenticationException("User is not authenticated");
        return val;
    }
    default @NotNull Role requireRole() {
        var val = getRole();
        if (val == null)
            throw new InsufficientAuthenticationException("User is not authenticated");
        return val;
    }
    default void requirePermission(Role role) {
        if (!requireRole().hasPermission(role)) {
            throw new AccessDeniedException("No access");
        }
    }
    default void requireAccountId(long accountId) {
        if (requireAccountId() != accountId) {
            throw new AccessDeniedException("No access");
        }
    }
    default void requirePermissionOrAccountIds(Role role, Long... accountIds) {
        if (requireRole().hasPermission(role)) {
            return;
        }
        for (Long accountId : accountIds) {
            if (accountId == null) continue;
            if (requireAccountId() == accountId) {
                return;
            }
        }
        throw new AccessDeniedException("No access");
    }
    default boolean hasPermission(Role role) {
        var current = getRole();
        return current != null && current.hasPermission(role);
    }
    //==================================
    default boolean hasInternalAccess(Project project) {
        return hasPermission(Role.STAFF) ||
                matchAccountId(project.getClient().getAccountId()) ||
                (project.getFreelancer() != null && matchAccountId(project.getFreelancer().getAccountId()));
    }
    default boolean hasInternalAccess(Transaction transaction) {
        return hasPermission(Role.STAFF) ||
                (transaction.getFromAccount() != null && matchAccountId(transaction.getFromAccount().getAccountId())) ||
                (transaction.getToAccount() != null && matchAccountId(transaction.getToAccount().getAccountId()));
    }
    default boolean hasInvisibilityBypass() {
        return hasPermission(Role.ADMIN);
    }
    //==================================
    boolean isAuthenticated();
}
