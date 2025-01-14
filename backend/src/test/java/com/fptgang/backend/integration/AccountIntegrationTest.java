package com.fptgang.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fptgang.backend.TestcontainersConfiguration;
import com.fptgang.backend.api.model.AccountDto;
import com.fptgang.backend.api.model.GetAccounts200Response;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.repository.AccountRepos;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@RunWith(SpringRunner.class)
@Import(TestcontainersConfiguration.class)
class AccountIntegrationTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AccountRepos accountRepos;

    @BeforeEach
    public void setUp() {
        accountRepos.deleteAll();
        accountRepos.saveAll(Arrays.asList(
                Account.builder().email("a@test.com")
                        .firstName("a")
                        .lastName("x")
                        .password("pwd")
                        .avatarUrl("string")
                        .role(Role.ADMIN)
                        .build(),
                Account.builder().email("b@test.com")
                        .firstName("b")
                        .lastName("y")
                        .password("pwd")
                        .avatarUrl("string")
                        .role(Role.ADMIN)
                        .isVerified(true)
                        .build()
        ));
    }

    @Test
    @WithMockUser(username = "testuser", roles = "ADMIN")
    public void testGetAccounts() throws Exception {
        var json = this.mockMvc.perform(MockMvcRequestBuilders
                        .get("/api/v1/account?page=0&size=20"))
                .andExpect(status().isOk())
                .andDo(MockMvcResultHandlers.print())
                .andReturn().getResponse().getContentAsString();
        var response = objectMapper.readValue(json, GetAccounts200Response.class);

        assertThat(response).isNotNull();
        assertThat(response.getContent()).isNotEmpty();
        assertThat(response.getTotalElements()).isEqualTo(2L);
        assertThat(response.getTotalPages()).isEqualTo(1);
        assertThat(response.getLast()).isTrue();
        assertThat(response.getFirst()).isTrue();
        assertThat(response.getNumberOfElements()).isEqualTo(2);
        assertThat(response.getEmpty()).isFalse();

        var account1 = response.getContent().get(0);
        assertThat(account1.getEmail()).isEqualTo("a@test.com");
        assertThat(account1.getFirstName()).isEqualTo("a");
        assertThat(account1.getLastName()).isEqualTo("x");
        assertThat(account1.getPassword()).isEqualTo("pwd");
        assertThat(account1.getAvatarUrl()).isEqualTo("string");
        assertThat(account1.getRole()).isEqualTo(AccountDto.RoleEnum.ADMIN);
        assertThat(account1.getIsVerified()).isFalse();

        var account2 = response.getContent().get(1);
        assertThat(account2.getEmail()).isEqualTo("b@test.com");
        assertThat(account2.getFirstName()).isEqualTo("b");
        assertThat(account2.getLastName()).isEqualTo("y");
        assertThat(account2.getPassword()).isEqualTo("pwd");
        assertThat(account2.getAvatarUrl()).isEqualTo("string");
        assertThat(account2.getRole()).isEqualTo(AccountDto.RoleEnum.ADMIN);
        assertThat(account2.getIsVerified()).isTrue();
    }

    //@Test
    public void testGetAccountsUnauthorized() throws Exception {
        this.mockMvc.perform(
                MockMvcRequestBuilders.get("/api/v1/account?page=0&size=20")
        ).andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "testuser", roles = "ADMIN")
    public void testGetAccountsInvalidQueryParams() throws Exception {
        this.mockMvc.perform(MockMvcRequestBuilders
                        .get("/api/v1/account?page=abc"))
                .andExpect(status().isBadRequest());
    }
}
