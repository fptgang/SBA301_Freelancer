package com.fptgang.backend.service;

import com.fptgang.backend.model.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AccountService {
    void update(Account account);
    Account findByEmail(String email);
    void deleteById(String email);
    Page<Account> getAll(Pageable pageable, String filter);
}
