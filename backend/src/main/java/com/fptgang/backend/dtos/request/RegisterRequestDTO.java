package com.fptgang.backend.dtos.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode
public class RegisterRequestDTO {

    private String email;

    private String password;

    private String confirmPassword;

    private String firstName;

    private String lastName;

}
