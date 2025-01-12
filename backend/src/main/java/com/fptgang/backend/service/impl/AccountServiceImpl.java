package com.fptgang.backend.service.impl;

import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.service.AccountService;
import com.fptgang.backend.util.OpenApiHelper;
import com.fptgang.backend.model.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepos accountRepos;

    public AccountServiceImpl(AccountRepos accountRepos) {
        this.accountRepos = accountRepos;
    }

    @Override
    public void update(Account account) {

    }

    @Override
    public Account findByEmail(String email) {
        return null;
    }

    @Override
    public void deleteById(String email) {

    }

    @Override
    public Page<Account> getAll(Pageable pageable, String filter) {
        var spec = OpenApiHelper.<com.fptgang.backend.model.Account>toSpecification(filter);
        return accountRepos.findAll(spec, pageable);
    }
}
