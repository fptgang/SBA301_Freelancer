package com.fptgang.backend.service.impl;

import com.fptgang.backend.mapper.template.ResetPasswordEmailTemplateMapper;
import com.fptgang.backend.model.Account;
import com.fptgang.backend.service.EmailService;
import com.fptgang.backend.util.TemplateUtil;
import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    @Value("${RESEND_API_KEY}")
    private String API_KEY;
    @Value("${COMPANY_NAME}")
    private String companyName;
    @Value("${EMAIL_FROM}")
    private String emailFrom;

    @Value("classpath:template/ResetPasswordEmailTemplate.html")
    private Resource resetPasswordEmailTemplate;

    private final ResetPasswordEmailTemplateMapper resetPasswordEmailTemplateMapper;

    public EmailServiceImpl(ResetPasswordEmailTemplateMapper resetPasswordEmailTemplateMapper) {
        this.resetPasswordEmailTemplateMapper = resetPasswordEmailTemplateMapper;
    }

    @Override
    public void sendMail(String from, String to, String subject, String html) {
        // send email
        Resend resend = new Resend(API_KEY);
        CreateEmailOptions params = CreateEmailOptions.builder()
                //"Acme <onboarding@resend.dev>"
                .from(from )
                .to(to)
                .subject(subject)
                .html(html)
                .build();
        try {
            CreateEmailResponse data = resend.emails().send(params);
            System.out.println(data.getId());
        } catch (ResendException e) {
            log.info(e.getMessage());
        }
    }

    @Override
    public void sendResetPasswordEmail(Account account, String resetLink) throws IOException {
        if (account.getEmail() == null || account.getEmail().isBlank()) {
            throw new IllegalArgumentException("Recipient email is missing.");
        }
        if (resetLink == null || resetLink.isBlank()) {
            throw new IllegalArgumentException("Reset link is missing.");
        }

        log.info("Preparing reset password email for: {}", account.getEmail());

        var template = resetPasswordEmailTemplate.getContentAsString(StandardCharsets.UTF_8);
        var data = resetPasswordEmailTemplateMapper.create(account, resetLink);
        String subject = "Password Reset Request";
        String content = TemplateUtil.render(resetPasswordEmailTemplate.getFilename(), template, data);

        sendMail(emailFrom, account.getEmail(), subject, content);

        log.info("Password reset email successfully sent to: {}", account.getEmail());
    }
}
