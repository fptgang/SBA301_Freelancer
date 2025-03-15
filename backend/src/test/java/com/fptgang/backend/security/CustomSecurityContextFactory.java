package com.fptgang.backend.security;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.test.context.support.WithSecurityContextFactory;

import java.util.List;

public class CustomSecurityContextFactory implements WithSecurityContextFactory<WithMockAppUser> {

    @Override
    public SecurityContext createSecurityContext(WithMockAppUser annotation) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();

        AppUser appUser = new AppUser(
                annotation.accountId(),
                annotation.username(),
                "",
                List.of(new SimpleGrantedAuthority(annotation.role()))
        );

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(appUser, null, appUser.getAuthorities());
        context.setAuthentication(auth);
        return context;
    }
}
