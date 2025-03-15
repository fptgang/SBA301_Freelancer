package com.fptgang.backend.security;

import com.fptgang.backend.model.Role;
import com.fptgang.backend.util.SecurityUtil;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

@Component
public class AuthContextImpl implements AuthContext {

    @Override
    public @Nullable Long getAccountId() {
        return SecurityUtil.getCurrentUserId();
    }

    @Override
    public @Nullable String getEmail() {
        return SecurityUtil.getCurrentUserEmail();
    }

    @Override
    public @Nullable Role getRole() {
        return SecurityUtil.getCurrentUserRole();
    }

    @Override
    public boolean isAuthenticated() {
        return SecurityUtil.isAuthenticated();
    }
}
