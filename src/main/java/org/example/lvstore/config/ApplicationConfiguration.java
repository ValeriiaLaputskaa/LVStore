package org.example.lvstore.config;

import lombok.RequiredArgsConstructor;
import org.example.lvstore.service.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetailsService;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfiguration {

    private final UserService userService;

    @Bean
    public UserDetailsService userDetailsService() {
        return userService::getUserByEmail;
    }
}
