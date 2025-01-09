package com.fptgang.backend.controller;

import com.fptgang.api.LoginApi;
import com.fptgang.model.LoginRequest;
import com.fptgang.model.LoginResponse;
import org.springframework.http.ResponseEntity;

public class AccountController implements LoginApi {
    @Override
    public ResponseEntity<LoginResponse> login(LoginRequest loginRequest) {
        return LoginApi.super.login(loginRequest);
    }
}
