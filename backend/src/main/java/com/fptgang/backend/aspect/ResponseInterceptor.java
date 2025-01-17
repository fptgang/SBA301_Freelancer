package com.fptgang.backend.aspect;

import com.fptgang.backend.api.model.AccountDto;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.util.SecurityUtil;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class ResponseInterceptor {
    private static final Logger LOGGER = LoggerFactory.getLogger(ResponseInterceptor.class);

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
        if (body instanceof AccountDto dto) {
            intercept(dto);
        }

        return body;
    }

    private void intercept(AccountDto dto) {
        dto.setPassword(null);

        Role role = SecurityUtil.getCurrentUserRole();

        // If the role is staff or above
        if (role != null && role.hasPermission(Role.STAFF)) {
            return;
        }

        // If the account is himself
        if (dto.getEmail().equals(SecurityUtil.getCurrentUserEmail())) {
            return;
        }

        dto.setBalance(null);
    }
}
