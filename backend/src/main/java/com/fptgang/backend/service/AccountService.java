package com.fptgang.backend.service;

import com.fptgang.backend.dtos.response.AccountResponseDTO;

public interface AccountService {
    void update(AccountResponseDTO accountDTO);
    AccountResponseDTO findByEmail(String email);
    void deleteById(String email);
}
