package com.fptgang.backend.integration;

import com.fptgang.backend.TestcontainersConfiguration;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.util.OpenApiHelper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.runner.RunWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.junit4.SpringRunner;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@RunWith(SpringRunner.class)
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@Import(TestcontainersConfiguration.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class OpenApiHelperIntegrationTest {

    // Account: String, BigDecimal, Enum, boolean, java.time.LocalDateTime
    // File: integer number
    // Refresh token: java.time.Instant

    @Autowired
    private AccountRepos accountRepos;

    @BeforeAll
    public void setUp() {
        accountRepos.deleteAll();
        accountRepos.save(Account.builder()
                .email("test1@example.com")
                .firstName("Alice")
                .role(Role.ADMIN)
                .isVisible(true)
                .balance(BigDecimal.valueOf(5000))
                .build());
        accountRepos.save(Account.builder()
                .email("test2@example.com")
                .firstName("Bob")
                .role(Role.STAFF)
                .isVisible(false)
                .balance(BigDecimal.valueOf(1500))
                .build());
        accountRepos.save(Account.builder()
                .email("test3@example.com")
                .firstName("Charlie")
                .role(Role.CLIENT)
                .isVisible(true)
                .balance(BigDecimal.valueOf(10000))
                .build());
    }

    // String Tests
    @Test
    public void testStringOperators() {
        // Equals
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("email,eq,test1@example.com")
        )).hasSize(1);

        // Not Equal
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("email,ne,test1@example.com")
        )).hasSize(2);

        // Contains
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("email,contains,test1")
        )).hasSize(1);

        // Not Contains
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("email,ncontains,test1")
        )).hasSize(2);

        // StartsWith
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("email,startswith,test")
        )).hasSize(3);

        // Not StartsWith
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("email,nstartswith,test")
        )).hasSize(0);

        // EndsWith
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("email,endswith,@example.com")
        )).hasSize(3);

        // Not EndsWith
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("email,nendswith,@example.com")
        )).hasSize(0);
    }

    // BigDecimal Tests
    @Test
    public void testBigDecimalOperators() {
        // Equals
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("balance,eq,5000")
        )).hasSize(1);

        // Not Equal
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("balance,ne,5000")
        )).hasSize(2);

        // Greater Than
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("balance,gt,2000")
        )).hasSize(2);

        // Less Than
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("balance,lt,2000")
        )).hasSize(1);

        // Greater Than or Equal
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("balance,gte,5000")
        )).hasSize(2);

        // Less Than or Equal
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("balance,lte,5000")
        )).hasSize(2);
    }

    // Enum Tests (Role)
    @Test
    public void testEnumOperators() {
        // Equals
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("role,eq,ADMIN")
        )).hasSize(1);

        // Not Equal
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("role,ne,ADMIN")
        )).hasSize(2);

        // In (comma separated)
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("role,in,ADMIN,CLIENT")
        )).hasSize(2);

        // Not In (comma separated)
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("role,nin,ADMIN,CLIENT")
        )).hasSize(1);
    }

    // Boolean Tests
    @Test
    public void testBooleanOperators() {
        // Equals True
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("isVisible,eq,true")
        )).hasSize(2);

        // Equals False
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("isVisible,eq,false")
        )).hasSize(1);

        // Not Equals True
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("isVisible,ne,true")
        )).hasSize(1);

        // Not Equals False
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("isVisible,ne,false")
        )).hasSize(2);
    }

    // LocalDateTime Tests
    @Test
    public void testLocalDateTimeOperators() {
        LocalDateTime currentTime = LocalDateTime.now();

        // Less Than
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("createdAt,lt," + currentTime.plusDays(1))
        )).hasSize(3);

        // Greater Than
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("createdAt,gt," + currentTime.minusDays(1))
        )).hasSize(3);

        // Less Than or Equal
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("createdAt,lte," + currentTime.plusDays(1))
        )).hasSize(3);

        // Greater Than or Equal
        assertThat(accountRepos.findAll(
                OpenApiHelper.toSpecification("createdAt,gte," + currentTime.minusDays(1))
        )).hasSize(3);
    }
}
