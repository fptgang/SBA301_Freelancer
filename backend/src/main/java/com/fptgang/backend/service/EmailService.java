package com.fptgang.backend.service;

public interface EmailService {

    void sendMail(String from, String to, String subject, String html);


}
