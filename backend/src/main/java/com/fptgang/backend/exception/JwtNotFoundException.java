package com.fptgang.backend.exception;

import org.springframework.security.core.AuthenticationException;

public class JwtNotFoundException extends AuthenticationException {
    public JwtNotFoundException(String msg) {
        super(msg);
    }
}
