package com.fptgang.backend.aspect;

import com.fptgang.backend.api.model.AccountDto;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Collection;

@Aspect
@Component
public class ResponseInterceptor {
    @Around("execution(org.springframework.http.ResponseEntity *(..))")
    public Object interceptResponseEntity(ProceedingJoinPoint joinPoint) throws Throwable {
        Object result = joinPoint.proceed();

        if (result instanceof ResponseEntity<?> responseEntity) {
            Object modifiedBody = modifyResponseBody(responseEntity.getBody());
            return ResponseEntity
                    .status(responseEntity.getStatusCode())
                    .headers(responseEntity.getHeaders())
                    .body(modifiedBody);
        }

        return result;
    }

    private Object modifyResponseBody(Object body) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null) {
            String username = authentication.getName();
            Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        }

        if (body instanceof AccountDto dto) {
            dto.setPassword(null);
        }

        return body;
    }
}
