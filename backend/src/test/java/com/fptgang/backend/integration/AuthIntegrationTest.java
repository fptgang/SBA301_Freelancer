package com.fptgang.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fptgang.backend.TestcontainersConfiguration;
import com.fptgang.backend.api.model.*;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.repository.AccountRepos;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.*;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@RunWith(SpringRunner.class)
@Import(TestcontainersConfiguration.class)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class AuthIntegrationTest {
    private static final String SESSION_ID = UUID.randomUUID().toString();

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AccountRepos accountRepos;

    private static String accessToken;
    private static String refreshToken;

    @Test
    @Order(1)
    public void testRegisterAccount() throws Exception {
        accountRepos.deleteAll();

        var requestBody = new RegisterRequestDto()
                .email("a@b.com")
                .firstName("Bob")
                .password("123")
                .confirmPassword("123");
        var request =
                MockMvcRequestBuilders
                        .post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody));
        this.mockMvc.perform(request).andExpect(status().isCreated());
    }

    @Test
    @Order(2)
    public void testLoginAccount() throws Exception {
        var requestBody = new LoginRequestDto()
                .email("a@b.com")
                .password("123");
        var request =
                MockMvcRequestBuilders
                        .post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody))
                        .cookie(new Cookie("sessionId", SESSION_ID));
        var response = objectMapper.readValue(
                this.mockMvc.perform(request)
                        .andExpect(status().isOk())
                        .andReturn().getResponse().getContentAsString(),
                AuthResponseDto.class
        );
        var acc = response.getAccountResponseDTO();

        assertThat(acc.getEmail()).isEqualTo("a@b.com");
        assertThat(acc.getFirstName()).isEqualTo("Bob");
        assertThat(acc.getLastName()).isNull();
        assertThat(acc.getAvatarUrl()).isNull();
        assertThat(acc.getRole()).isEqualTo(AccountDto.RoleEnum.CLIENT);
        assertThat(acc.getIsVerified()).isFalse();

        accessToken = response.getToken();
        refreshToken = response.getRefreshToken();
    }

    @Test
    @Order(3)
    public void testMe() throws Exception {
        var request =
                MockMvcRequestBuilders
                        .get("/api/v1/auth/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer " + accessToken)
                        .cookie(new Cookie("sessionId", SESSION_ID));
        var acc = objectMapper.readValue(
                this.mockMvc.perform(request)
                        .andExpect(status().isOk())
                        .andReturn().getResponse().getContentAsString(),
                AccountDto.class
        );

        assertThat(acc.getEmail()).isEqualTo("a@b.com");
        assertThat(acc.getFirstName()).isEqualTo("Bob");
        assertThat(acc.getLastName()).isNull();
        assertThat(acc.getAvatarUrl()).isNull();
        assertThat(acc.getRole()).isEqualTo(AccountDto.RoleEnum.CLIENT);
        assertThat(acc.getIsVerified()).isFalse();
    }

    @Test
    @Order(4)
    public void testIssueNewAccessToken() throws Exception {
        var request =
                MockMvcRequestBuilders
                        .post("/api/v1/auth/refresh-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(refreshToken)
                        .cookie(new Cookie("sessionId", SESSION_ID));
        var res = objectMapper.readValue(
                this.mockMvc.perform(request)
                        .andExpect(status().isOk())
                        .andReturn().getResponse().getContentAsString(),
                JwtResponseDto.class
        );

        assertThat(res.getRefreshToken()).isEqualTo(refreshToken);
        accessToken = res.getAccessToken();
    }

    @Test
    @Order(5)
    public void testLogout() throws Exception {
        var request =
                MockMvcRequestBuilders
                        .get("/api/v1/auth/logout")
                        .header("Authorization", "Bearer " + accessToken)
                        .cookie(new Cookie("sessionId", SESSION_ID));
        this.mockMvc.perform(request).andExpect(status().isOk());
    }
}
