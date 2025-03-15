package com.fptgang.backend.security;

import org.springframework.security.test.context.support.WithSecurityContext;
import java.lang.annotation.*;

@Retention(RetentionPolicy.RUNTIME)
@Target({ ElementType.METHOD, ElementType.TYPE })
@WithSecurityContext(factory = CustomSecurityContextFactory.class)
public @interface WithMockAppUser {
    long accountId() default 1L;
    String username() default "test@example.com";
    String role() default "ROLE_ADMIN";
}
