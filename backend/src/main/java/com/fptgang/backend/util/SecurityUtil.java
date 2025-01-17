package com.fptgang.backend.util;

import com.fptgang.backend.exception.JwtNotFoundException;
import com.fptgang.backend.model.Role;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import javax.annotation.Nullable;
import java.util.Objects;

public class SecurityUtil {
    @NotNull
    public static Jwt getCurrentJwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication instanceof JwtAuthenticationToken) {
            return ((JwtAuthenticationToken) authentication).getToken();
        }

        throw new JwtNotFoundException("Authentication token not found");
    }

    @NotNull
    public static String getCurrentUserEmail() {
        return getEmailFromJwt(getCurrentJwt());
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
