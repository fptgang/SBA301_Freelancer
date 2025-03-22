package com.fptgang.backend.controller;

import com.fptgang.backend.api.controller.AccountsApi;
import com.fptgang.backend.api.model.AccountDto;
import com.fptgang.backend.api.model.GetAccounts200Response;
import com.fptgang.backend.api.model.Pageable;
import com.fptgang.backend.mapper.AccountMapper;
import com.fptgang.backend.mapper.DetailLevel;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.File;
import com.fptgang.backend.model.Project;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.service.AccountService;
import com.fptgang.backend.service.FileService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.OpenApiHelper;
import com.fptgang.backend.util.SecurityUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/v1")
public class AccountController implements AccountsApi {
    private final AccountService accountService;
    private final AccountMapper accountMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final FileService fileService;

    public AccountController(AccountService accountService, AccountMapper accountMapper, SimpMessagingTemplate messagingTemplate, FileService fileService) {
        this.accountService = accountService;
        this.accountMapper = accountMapper;
        this.messagingTemplate = messagingTemplate;
        this.fileService = fileService;
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<AccountDto> createAccount(AccountDto accountDto) {
        log.info("Creating account");
        accountDto = accountMapper
                .toDTO(accountService.create(accountMapper.toEntity(accountDto)), DetailLevel.FULL);
        ResponseEntity<AccountDto> response = new ResponseEntity<>(accountDto, HttpStatus.CREATED);

        messagingTemplate.convertAndSend("resources/accounts", accountDto);
        return response;

    }

    @Override
    public ResponseEntity<Void> deleteAccount(Long accountId) {
        log.info("Deleting account" + accountId);
        accountService.deleteById(accountId);
        messagingTemplate.convertAndSend("resources/accounts", "Deleted account " + accountId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Override
    public ResponseEntity<AccountDto> getAccountById(Long accountId) {
        log.info("Getting account by id ");
        if(SecurityUtil.hasRole(Role.CLIENT, Role.FREELANCER) && SecurityUtil.requireCurrentUserId() != accountId) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return new ResponseEntity<>(accountMapper.toDTO(accountService.findById(accountId),DetailLevel.FULL), HttpStatus.OK);
    }

    @Override
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<GetAccounts200Response> getAccounts(Pageable pageable, String filter, String search) {
        log.info("Getting accounts");
        var includeInvisible = SecurityUtil.hasPermission(Role.ADMIN);
        var params = ListParams.builder()
                .pageable(OpenApiHelper.toPageable(pageable))
                .search(search)
                .filter(filter)
                .includeInvisible(includeInvisible);

        // Staff cannot view Admin
        if (SecurityUtil.hasRole(Role.STAFF)) {
            params.setFilter("role", "in", "STAFF,CUSTOMER");
        }
        var res = accountService
                .getAll(params.build())
                .map((account) -> accountMapper.toDTO(account, DetailLevel.SUMMARY));
        return OpenApiHelper.respondPage(res, GetAccounts200Response.class);
    }

    @Override
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AccountDto> updateAccount(Long accountId, AccountDto accountDto) {
        accountDto.setAccountId(accountId); // Override accountId
        log.info("Updating account {}", accountId);

        if (!SecurityUtil.hasPermission(Role.ADMIN)) {
            accountDto.setBalance(null);
            accountDto.setRole(null);
            accountDto.setIsVisible(null);
        }

        if (!SecurityUtil.hasPermission(Role.STAFF)) {
            accountDto.setIsVerified(null);
            accountDto.setVerifiedAt(null);
        }

        if (SecurityUtil.hasRole(Role.CLIENT, Role.FREELANCER)) {
            if (SecurityUtil.requireCurrentUserId() != accountId) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        messagingTemplate.convertAndSend("resources/accounts", accountDto);
        return ResponseEntity.ok(accountMapper.toDTO(accountService.update(accountMapper.toEntity(accountDto)), DetailLevel.FULL));
    }

    /**
     * Can access: Any
     */
    @Override
    public ResponseEntity<AccountDto> updateAccountAvatar(Long accountId, MultipartFile blob) {
        log.info("Updating account avatar");

        if (!SecurityUtil.hasRole(Role.STAFF))
            accountId = SecurityUtil.requireCurrentUserId();

        File file = fileService.create(blob);
        Account account = accountService.update(
                Account.builder()
                        .accountId(accountId)
                        .avatarUrl(file.getFileUrl())
                        .build()
        );

        return new ResponseEntity<>(accountMapper.toDTO(account, DetailLevel.FULL), HttpStatus.OK);
    }
}
