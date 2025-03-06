package com.fptgang.backend.service.impl;

import com.fptgang.backend.model.Account;
import com.fptgang.backend.model.Role;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.security.PasswordEncoderConfig;
import com.fptgang.backend.service.AccountService;
import com.fptgang.backend.service.params.ListParams;
import com.fptgang.backend.util.OpenApiHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@Slf4j
public class AccountServiceImpl implements AccountService {
    private final String DEFAULT_ESCROW_EMAIL = "escrow@hirable.com";
    private final AccountRepos accountRepos;
    private final PasswordEncoderConfig passwordEncoderConfig;

    @Value("${hirable.account.escrow:0}")
    private Long escrowAccountId;

    @Autowired
    public AccountServiceImpl(AccountRepos accountRepos, PasswordEncoderConfig passwordEncoderConfig) {
        this.accountRepos = accountRepos;
        this.passwordEncoderConfig = passwordEncoderConfig;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void initEscrowAccount() {
        log.info("Configured escrow account id: {}", escrowAccountId);

        if (escrowAccountId != null && escrowAccountId > 0) {
            var acc = findById(escrowAccountId);
            if (acc == null) {
                escrowAccountId = 0L;
                log.info("Cannot find escrow account. Falling back to default...");
            } else if (acc.getRole() != Role.ADMIN) {
                escrowAccountId = 0L;
                log.info("Escrow account is not ADMIN. Falling back to default...");
            } else {
                return;
            }
        }

        var acc = accountRepos.findByEmail(DEFAULT_ESCROW_EMAIL).orElse(null);
        if (acc != null) {
            escrowAccountId = acc.getAccountId();
            log.info("Picked account id {} as escrow", escrowAccountId);
            return;
        }

        acc = Account.builder()
                .email(DEFAULT_ESCROW_EMAIL)
                .isVerified(true)
                .verifiedAt(LocalDateTime.now())
                .firstName("Escrow")
                .role(Role.ADMIN)
                .balance(BigDecimal.ZERO)
                .password(passwordEncoderConfig.bcryptEncoder().encode("1"))
                .build();
        acc = accountRepos.save(acc);
        escrowAccountId = acc.getAccountId();
        log.info("Created escrow account id {}", escrowAccountId);
    }

    @Override
    public long getEscrowAccountId() {
        return escrowAccountId;
    }

    @Override
    public Account create(Account account) {
        return accountRepos.save(account);
    }

    @Override
    public Account findById(long id) {
        return accountRepos.findById(id).orElse(null);
    }

    @Override
    public Account findByEmail(String email) {
        return accountRepos.findByEmail(email).orElse(null);
    }

    @Override
    public Account update(Account account) {
        if (account.getAccountId() == null) {
            throw new IllegalArgumentException("Account does not exist");
        }
        return accountRepos.save(account);
    }

    @Override
    public Account deleteById(long id) {
        Account account = accountRepos.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Account does not exist"));
        account.setIsVisible(false);
        return accountRepos.save(account);
    }

    @Override
    public Page<Account> getAll(ListParams params) {
        var spec = OpenApiHelper.groupBy( params.<Account>toSpec(), "accountId");
        return accountRepos.findAll(spec, params.getPageable());
    }
}
