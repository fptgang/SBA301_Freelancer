package com.fptgang.backend.security;

import com.fptgang.backend.model.Role;
import com.fptgang.backend.service.JwtService;
import com.fptgang.backend.util.SecurityUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Service
public class JWTAuthenticationFilter extends OncePerRequestFilter {
    private static final Logger LOGGER = LoggerFactory.getLogger(JWTAuthenticationFilter.class);

    private final JwtService tokenService;

    public JWTAuthenticationFilter(JwtService tokenService) {
        this.tokenService = tokenService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        setAuthContext(request);
        filterChain.doFilter(request, response);
    }

    private void setAuthContext(HttpServletRequest request) {
        String token = getJWTFromRequest(request);

        if (!StringUtils.hasText(token)) {
            return;
        }

        Jwt jwt = tokenService.parseToken(token);

        if (jwt == null) {
            LOGGER.debug("An invalid or expired JWT is used {}", token);
            return;
        }

        String email = SecurityUtil.getEmailFromJwt(jwt);
        Role role = SecurityUtil.getRoleFromJwt(jwt);

        if (role == null) {
            LOGGER.debug("JWT using invalid role {}", token);
            return;
        }

        JwtAuthenticationToken authenticationToken = new JwtAuthenticationToken(
                jwt,
                List.of(new SimpleGrantedAuthority(role.toString()))
        );
        authenticationToken.setDetails(
                new WebAuthenticationDetailsSource().buildDetails(request)
        );
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);

        LOGGER.debug("Authentication context created under granted to {} with role {}", email, role);
    }

    private String getJWTFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}