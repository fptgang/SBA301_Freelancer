package com.fptgang.backend.security;

import com.fptgang.backend.model.Role;
import org.jetbrains.annotations.NotNull;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

public class AppUser extends User {
    @Getter
    private final long accountId;
    private final Role role;

    public AppUser(long accountId, String username, String password, Collection<? extends GrantedAuthority> authorities) {
        super(username, password, authorities);

        if (authorities.isEmpty())
            throw new IllegalArgumentException("Authorities cannot be empty");

        this.accountId = accountId;
        String authority = getAuthorities().iterator().next().getAuthority();
        role = Role.valueOf(authority.startsWith("ROLE_") ? authority.substring("ROLE_".length()) : authority);
    }

    @NotNull
    public Role getRole() {
        return role;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true; // a logged in account should be visible already
    }
}
