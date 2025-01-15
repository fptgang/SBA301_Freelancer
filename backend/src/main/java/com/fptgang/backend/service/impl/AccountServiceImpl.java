package com.fptgang.backend.service.impl;

import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.security.PasswordEncoderConfig;
import com.fptgang.backend.service.AccountService;
import com.fptgang.backend.util.OpenApiHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepos accountRepos;
    private final PasswordEncoderConfig passwordEncoderConfig;

    @Autowired
    public AccountServiceImpl(AccountRepos accountRepos, PasswordEncoderConfig passwordEncoderConfig) {
        this.accountRepos = accountRepos;
        this.passwordEncoderConfig = passwordEncoderConfig;
        createTestAccount();
    }

    private void createTestAccount() {
        for (int i = 0; i < 4; i++) {
            if (accountRepos.findByEmail((i % 2 > 0 ? "admin" :"test") + (i/2+1) + "@example.com").isPresent()) {
                continue;
            }
            createTestAccount(i);
        }
    }

    private Account createTestAccount(Integer accountId) {
        Account account = new Account();
        account.setEmail((accountId % 2 > 0 ? "admin" :"test") + (accountId/2+1)  + "@example.com");
        account.setPassword(passwordEncoderConfig.bcryptEncoder().encode("12345")   );
        account.setVisible(true);
        account.setBalance(BigDecimal.valueOf(0));
        account.setVerified(false);
        account.setRole(accountId % 2 > 0 ? Role.ADMIN : Role.CLIENT);
        account.setFirstName("John");
        account.setLastName(accountId % 2 > 0 ? "Admin" : "Doe");
        return create(account);
    }

    @Override
    public Account create(Account account) {
        if (accountRepos.findByEmail(account.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }
        return accountRepos.save(account);
    }

    @Override
    public Account findById(long id) {
        return accountRepos.findById(id).orElse(null);
    }

    @Override
    public Account findByEmail(String email) {
        return accountRepos.findByEmail(email).orElse(null);
    }

    @Override
    public Account update(Account account) {
        if (account.getAccountId() == null || !accountRepos.existsById(account.getAccountId())) {
            throw new IllegalArgumentException("Account does not exist");
        }
        return accountRepos.save(account);
    }

    @Override
    public Account deleteById(long id) {
        Account account = accountRepos.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Account does not exist"));
        account.setVisible(false);
        return accountRepos.save(account);
    }

    @Override
    public Page<Account> getAll(Pageable pageable, String filter) {
        var spec = OpenApiHelper.<Account>toSpecification(filter);
        return accountRepos.findAllByVisibleTrue(pageable, spec);
    }
}
