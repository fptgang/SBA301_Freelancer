package com.fptgang.backend.util;

import com.fptgang.backend.model.Role;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import javax.annotation.Nullable;
import java.util.Objects;

public class SecurityUtil {

    public static boolean isAuthenticated() {
        return SecurityContextHolder.getContext().getAuthentication() != null;
    }

    public static boolean isGuest() {
        return !isAuthenticated();
    }

    @NotNull
    public static String requireCurrentUserEmail() {
        return Objects.requireNonNull(getCurrentUserEmail());
    }

    @Nullable
    public static String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication instanceof JwtAuthenticationToken auth) {
            return getEmailFromJwt(auth.getToken());
        } else if (authentication instanceof UsernamePasswordAuthenticationToken auth) {
            return ((User) auth.getPrincipal()).getUsername();
        }

        return null;
    }

    @SuppressWarnings("BooleanMethodIsAlwaysInverted")
    @NotNull
    public static boolean hasPermission(Role role) {
        return requireCurrentUserRole().hasPermission(role);
    }

    @NotNull
    public static boolean isRole(Role... roles) {
        for (Role role : roles) {
            if (isRole(role)) {
                return true;
            }
        }
        return false;
    }

    @NotNull
    public static Role requireCurrentUserRole() {
        return Objects.requireNonNull(getCurrentUserRole());
    }

    @Nullable
    public static Role getCurrentUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication instanceof JwtAuthenticationToken auth) {
            return getRoleFromJwt(auth.getToken());
        } else if (authentication instanceof UsernamePasswordAuthenticationToken auth) {
            String role = auth.getAuthorities().iterator().next().getAuthority();

            if (role.startsWith("ROLE_")) {
                role = role.substring(5);
            }

            return Role.valueOf(role);
        }

        return null;
    }

    @Nullable
    public static Jwt getCurrentJwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication instanceof JwtAuthenticationToken) {
            return ((JwtAuthenticationToken) authentication).getToken();
        }

        return null;
    }

    @NotNull
    public static String getEmailFromJwt(Jwt jwt) {
        return Objects.requireNonNull(jwt.getSubject());
    }

    @Nullable
    public static Role getRoleFromJwt(Jwt jwt) {
        try {
            return Role.valueOf(jwt.getClaimAsString("scope"));
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
