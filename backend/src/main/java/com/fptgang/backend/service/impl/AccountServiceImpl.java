package com.fptgang.backend.service.impl;

import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.service.AccountService;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.util.OpenApiHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class AccountServiceImpl implements AccountService {
    private static final Logger LOGGER = LoggerFactory.getLogger(AccountServiceImpl.class);
    private final AccountRepos accountRepos;

    public AccountServiceImpl(AccountRepos accountRepos) {
        this.accountRepos = accountRepos;
    }

    @Override
    public Account create(Account account) {
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
        return accountRepos.findAll(spec, pageable);
    }
}
