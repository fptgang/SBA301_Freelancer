package com.fptgang.backend.security;

import com.fptgang.backend.model.Account;
import com.fptgang.backend.repository.AccountRepos;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private static final Logger log = LoggerFactory.getLogger(CustomUserDetailsService.class);
    @Autowired
    private AccountRepos accountRepos;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("User logged in successfully{}", username);
        try {
            Account account = accountRepos.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
            return new AppUser(account.getEmail(), account.getPassword() == null ? "" : account.getPassword(), List.of(new SimpleGrantedAuthority(account.getRole().toString())));
        } catch (Exception e) {
            log.error("User not found{}", e.getMessage());
            throw new UsernameNotFoundException("User not found");
        }

    }
}
