package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.AccountsApi;
import com.fptgang.backend.api.model.AccountDto;
import com.fptgang.backend.api.model.GetAccounts200Response;
import com.fptgang.backend.api.model.GetAccountsPageableParameter;
import com.fptgang.backend.mapper.AccountMapper;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.service.AccountService;
import com.fptgang.backend.util.OpenApiHelper;
import com.fptgang.backend.util.SecurityUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1")
public class AccountController implements AccountsApi {
    private final AccountService accountService;
    private final AccountMapper accountMapper;

    public AccountController(AccountService accountService, AccountMapper accountMapper) {
        this.accountService = accountService;
        this.accountMapper = accountMapper;
    }

    @Override
    public ResponseEntity<AccountDto> createAccount(AccountDto accountDto) {
        log.info("Creating account");

        ResponseEntity<AccountDto> response = new ResponseEntity<>(accountMapper
                .toDTO(accountService.create(accountMapper.toEntity(accountDto))), HttpStatus.CREATED);
        ;
        return response;

    }

    @Override
    public ResponseEntity<Void> deleteAccount(Integer accountId) {
        log.info("Deleting account" + accountId);
        accountService.deleteById(Long.valueOf(accountId));
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<AccountDto> getAccountById(Integer accountId) {
        log.info("Getting account by id ");
        return new ResponseEntity<>(accountMapper.toDTO(accountService.findById(Long.valueOf(accountId))), HttpStatus.OK);
    }

    @Override
    public ResponseEntity<GetAccounts200Response> getAccounts(GetAccountsPageableParameter pageable, String filter) {
        log.info("Getting accounts");
        var page = OpenApiHelper.toPageable(pageable);
        var res = accountService.getAll(page, filter).map(accountMapper::toDTO);
        return OpenApiHelper.respondPage(res, GetAccounts200Response.class);
    }

    @Override
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AccountDto> updateAccount(Integer accountId, AccountDto accountDto) {
        log.info("Updating account " + accountId);

        if (!SecurityUtil.hasPermission(Role.ADMIN)) {
            accountDto.setBalance(null);
            accountDto.setRole(null);
            accountDto.setIsVisible(null);
        }

        if (!SecurityUtil.hasPermission(Role.STAFF)) {
            accountDto.setIsVerified(null);
            accountDto.setVerifiedAt(null);
        }

        if (SecurityUtil.isRole(Role.CLIENT, Role.FREELANCER)) {
            if (!accountService.findByEmail(SecurityUtil.getCurrentUserEmail())
                    .getAccountId()
                    .equals(Long.valueOf(accountId))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        return ResponseEntity.ok(accountMapper.toDTO(accountService.update(accountMapper.toEntity(accountDto))));
    }
}
