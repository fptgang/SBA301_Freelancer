package com.fptgang.backend.service;

import com.fptgang.backend.model.Account;
import com.fptgang.backend.service.params.ListParams;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AccountService {
    long getEscrowAccountId();
    Account create(Account account);
    Account findById(long id);
    Account findByEmail(String email);
    Account update(Account account);
    Account deleteById(long id);
    Page<Account> getAll(ListParams params);
}
