package com.fptgang.backend.aspect;

import com.fptgang.backend.api.model.AccountDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.context.annotation.Import;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.stereotype.Component;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import static org.assertj.core.api.Assertions.assertThat;

@SpringJUnitConfig
@Import(ResponseInterceptorTest.TestConfig.class)
public class ResponseInterceptorTest {
    @Autowired
    private TestComponent testComponent;

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    public void testAccountPasswordRedacted() {
        var redacted = new AccountDto().password(null);
        assertThat(testComponent.returnAccount().getBody()).isEqualTo(redacted);
    }

    @Configuration
    @EnableAspectJAutoProxy
    static class TestConfig {
        @Bean
        public ResponseInterceptor responseInterceptor() {
            return new ResponseInterceptor();
        }

        @Bean
        public TestComponent testComponent() {
            return new TestComponent();
        }
    }

    @Component
    public static class TestComponent {
        public ResponseEntity<AccountDto> returnAccount() {
            return ResponseEntity.ok(new AccountDto().password("123"));
        }
    }
}
