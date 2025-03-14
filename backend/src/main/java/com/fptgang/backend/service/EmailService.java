package com.fptgang.backend.service;

import com.fptgang.backend.model.Account;

import java.io.IOException;

public interface EmailService {

    void sendMail(String from, String to, String subject, String html);

    void sendResetPasswordEmail(Account account, String resetLink) throws IOException;

}
