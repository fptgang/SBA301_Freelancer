package com.fptgang.backend.mapper;

import com.fptgang.backend.TestcontainersConfiguration;
import com.fptgang.backend.model.Account;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
public class AccountMapperTest {
    @Autowired
    private AccountMapper accountMapper;

    @Test
    public void testToEntity() {

    }

    @Test
    public void testToDto() {
        var entity = Account.builder()
                .email("a@x.com")
                .createdAt(LocalDateTime.now())
                .build();
        var dto = accountMapper.toDTO(entity);
        assertThat(dto.getEmail()).isEqualTo("a@x.com");
    }
}
