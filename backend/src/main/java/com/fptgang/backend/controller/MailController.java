package com.fptgang.backend.controller;

import com.fptgang.backend.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/mail")
public class MailController {
    private static final Logger log = LoggerFactory.getLogger(MailController.class);
    private final EmailService emailService;

    public MailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendMail(@RequestParam String to) {
        try {
            String from = "Nguoi Yeu Cua Duyen <vi@mail.biddify.fun>";
            String subject = "Happy New Year From your boyfriend";
            String html = "<h1>your gift below</h1><p><a href=\"https://happy-new-year-my-mimi-hj4h.vercel.app/\">Click here</a></p>";
            emailService.sendMail(
                    from,
                    to,
                    subject,
                    html
            );
            return ResponseEntity.ok().body("Email sent successfully");
        } catch (Exception e) {
            log.info(e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to send email");
        }
    }

}
