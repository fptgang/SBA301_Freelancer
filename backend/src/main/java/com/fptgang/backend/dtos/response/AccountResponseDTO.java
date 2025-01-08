package com.fptgang.backend.dtos.response;

import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AccountResponseDTO {

    private Long accountId;

    private String email;

    private String firstName;

    private String lastName;

    private Role role;

    public AccountResponseDTO(Account account) {
        this.accountId = account.getAccountId();
        this.email = account.getEmail();
        this.role = account.getRole();
        this.firstName = account.getFirstName();
        this.lastName = account.getLastName();
    }
}
