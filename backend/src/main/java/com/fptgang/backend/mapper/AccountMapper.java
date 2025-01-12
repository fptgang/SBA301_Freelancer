package com.fptgang.backend.mapper;

import com.fptgang.backend.dto.AccountDto;
import com.fptgang.backend.model.Account;
import org.springframework.stereotype.Component;

@Component
public class AccountMapper {
    public AccountDto toDto(Account account) {
        var dto = new AccountDto();
        dto.setAccountId(account.getAccountId());
        return dto;
    }

    public Account fromDto(AccountDto dto) {
        var entity = new Account();
        dto.setAccountId(dto.getAccountId());
        return entity;
    }
}
