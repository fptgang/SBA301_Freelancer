package com.fptgang.backend.security;

import com.fptgang.backend.model.Role;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

public class AppUser extends User {
    private final Role role;

    public AppUser(String username, String password, Collection<? extends GrantedAuthority> authorities) {
        super(username, password, authorities);

        if (authorities.isEmpty())
            throw new IllegalArgumentException("Authorities cannot be empty");

        role = Role.valueOf(getAuthorities().iterator().next().getAuthority());
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
