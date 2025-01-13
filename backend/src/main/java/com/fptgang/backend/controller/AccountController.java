package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.AccountApi;
import com.fptgang.backend.api.model.AccountDto;
import com.fptgang.backend.api.model.GetAccounts200Response;
import com.fptgang.backend.api.model.GetAccountsPageableParameter;
import com.fptgang.backend.mapper.AccountMapper;
import com.fptgang.backend.service.AccountService;
import com.fptgang.backend.util.OpenApiHelper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class AccountController implements AccountApi {
    private final AccountService accountService;
    private final AccountMapper accountMapper;

    public AccountController(AccountService accountService, AccountMapper accountMapper) {
        this.accountService = accountService;
        this.accountMapper = accountMapper;
    }

    @Override
    public ResponseEntity<AccountDto> createAccount(AccountDto accountDto) {
        return AccountApi.super.createAccount(accountDto);
    }

    @Override
    public ResponseEntity<Void> deleteAccount(Integer accountId) {
        return AccountApi.super.deleteAccount(accountId);
    }

    @Override
    public ResponseEntity<AccountDto> getAccountById(String accountId) {
        return AccountApi.super.getAccountById(accountId);
    }

    @Override
    public ResponseEntity<GetAccounts200Response> getAccounts(GetAccountsPageableParameter pageable, String filter) {
        var page = OpenApiHelper.toPageable(pageable);
        var res = accountService.getAll(page, filter).map(accountMapper::toDTO);
        return OpenApiHelper.respondPage(res, GetAccounts200Response.class);
    }

    @Override
    public ResponseEntity<AccountDto> updateAccount(String accountId, AccountDto accountDto) {
        return AccountApi.super.updateAccount(accountId, accountDto);
    }
}
