package com.fptgang.backend.security;

import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.Role;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class TokenService {

    private static final Logger log = LoggerFactory.getLogger(TokenService.class);
    @Autowired
    private JwtEncoder encoder;
    @Autowired
    private JwtDecoder jwtDecoder;

    public String token(Authentication authentication) {
        log.info("begin token");
        Instant now = Instant.now();
        long expiry = 36000L;
        // @formatter:off
        String scope = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(" "));
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("self")
                .issuedAt(now)
                .expiresAt(now.plusSeconds(expiry))
                .subject(authentication.getName())
                .claim("scope", scope)
                .build();
        // @formatter:on
        return this.encoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }

    public String getEmailFromToken(String token) {
        try {
//            String email = jwtDecoder.decode(token).getSubject();
            Jwt jwt = jwtDecoder.decode(token);
            if (Objects.requireNonNull(jwt.getExpiresAt()).isAfter(Instant.now())) {
                return jwtDecoder.decode(token).getSubject();
            }
        } catch (Exception e) {
            log.info("Invalid token: {}", e.getMessage());
        }
        return null;

    }

    public boolean isTokenValid(String token) {
        try {
            Jwt jwt = jwtDecoder.decode(token);
            return !Objects.requireNonNull(jwt.getExpiresAt()).isBefore(Instant.now());
        } catch (Exception e) {
            return false;
        }
    }

    public boolean invalidateToken(String token) {
        try {
            jwtDecoder.decode(token);
            encoder.encode(JwtEncoderParameters.from(JwtClaimsSet.builder().issuer("self").subject("invalid").build()));
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Role getRoleFromToken(String token) {
        try {
            return Role.valueOf(jwtDecoder.decode(token).getClaimAsString("scope"));
        } catch (JwtValidationException e) {
            throw new InvalidInputException("Invalid token" + e.getMessage());
        }
    }
}
