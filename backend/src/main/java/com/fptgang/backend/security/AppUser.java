package com.fptgang.backend.security;

import com.fptgang.backend.model.Role;
import org.antlr.v4.runtime.misc.NotNull;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

public class AppUser extends User {


    public AppUser(String username, String password, Collection<? extends GrantedAuthority> authorities) {
        super(username, password, authorities);
    }

    @NotNull
    public Role getRole() {
        return getAuthorities().isEmpty() ? Role.CLIENT : // TODO FIX THIS ROLE
                Role.valueOf(getAuthorities().iterator().next().getAuthority());
    }



}
