package com.fptgang.backend.mapper.template;

import com.fptgang.backend.model.Account;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;

@Component
public class ResetPasswordEmailTemplateMapper {
    public Map<String, Object> create(Account entity, String resetLink) {
        return Map.of(
                "firstName", Optional.ofNullable(entity.getFirstName()).orElse("User"),
                "resetLink", resetLink
        );
    }
}