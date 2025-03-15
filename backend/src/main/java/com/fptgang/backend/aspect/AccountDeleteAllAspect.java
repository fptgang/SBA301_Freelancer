package com.fptgang.backend.aspect;
import com.fptgang.backend.repository.AccountRepos;
import com.fptgang.backend.service.AccountService;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Aspect
@Component
public class AccountDeleteAllAspect {

    private final AccountRepos accountRepos;
    private final AccountService accountService;

    public AccountDeleteAllAspect(AccountRepos accountRepos,
                                  AccountService accountService) {
        this.accountRepos = accountRepos;
        this.accountService = accountService;
    }

    @After("execution(* com.fptgang.backend.repository.AccountRepos.deleteAll(..))")
    @Transactional
    public void afterDeleteAll() {
        log.info("Trying to recover escrow account after deleting all accounts");
        accountRepos.resetAutoIncrement();
        accountService.initEscrowAccount();
    }
}
