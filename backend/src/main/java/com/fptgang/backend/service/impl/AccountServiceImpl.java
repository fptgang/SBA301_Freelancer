package com.fptgang.backend.service.impl;

import com.fptgang.backend.dtos.response.AccountResponseDTO;
import com.fptgang.backend.exception.InvalidInputException;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.service.AccountService;
import org.springframework.stereotype.Service;


@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepos accountRepos;

    public AccountServiceImpl(AccountRepos accountRepos) {
        this.accountRepos = accountRepos;
    }

    @Override
    public void deleteById(String email) {

    }

    public Account toEntity(AccountResponseDTO accountDTO){
        Account account = accountRepos.findById(accountDTO.getAccountId()).orElseThrow(() ->
                new InvalidInputException("Account not found"));
        account.setAccountId(accountDTO.getAccountId());
        account.setEmail(accountDTO.getEmail());
        account.setFirstName(accountDTO.getFirstName());
        account.setLastName(accountDTO.getLastName());
        account.setRole(accountDTO.getRole());
        return account;
    }

    @Override
    public void update(AccountResponseDTO accountDTO) {
            Account account = toEntity(accountDTO);
            accountRepos.save(account);
    }

    public AccountResponseDTO findByEmail(String email) {
        Account account = accountRepos.findByEmail(email).orElse(null);
        return account != null ? new AccountResponseDTO(account) :null;
    }
}
