package org.example.lvstore.config.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;

import static org.example.lvstore.service.enums.Role.*;


@EnableWebSecurity
@EnableMethodSecurity
@Configuration
@RequiredArgsConstructor
public class SecurityConfiguration {

    private final CoockieBearerTokenResolver coockieBearerTokenResolver;
    private final CustomJwtAuthenticationConverter customJwtAuthenticationConverter;
    private final ClientRegistrationRepository clientRegistrationRepository;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(c -> c
                .requestMatchers("/login").permitAll()
                // Продавець
                .requestMatchers(HttpMethod.POST, "/orders").hasAnyAuthority(SELLER.name(), STORE_ADMINISTRATOR.name()) // створення замовлення
                .requestMatchers(HttpMethod.PUT, "/orders/{id}/deliver").hasAnyAuthority(SELLER.name(), STORE_ADMINISTRATOR.name()) // підтвердження отримання

                // Менеджер складу
                .requestMatchers(HttpMethod.PUT, "/orders/{id}/cancel").hasAnyAuthority(WAREHOUSE_MANAGER.name(), STORE_ADMINISTRATOR.name())
                .requestMatchers(HttpMethod.PUT, "/orders/{id}/ship").hasAuthority(WAREHOUSE_MANAGER.name())

                // Адміністратор магазину
                .requestMatchers(HttpMethod.PUT, "/orders/{id}/confirm").hasAuthority(STORE_ADMINISTRATOR.name())

                // Усі користувачі, які мають доступ до перегляду замовлень
                .requestMatchers(HttpMethod.GET, "/orders", "/orders/**").hasAnyAuthority(
                        SELLER.name(), STORE_ADMINISTRATOR.name(), WAREHOUSE_MANAGER.name()
                )

                // Інші доступи, що залежать від ролі:
                // Склади, Продукти, Користувачі, Запаси в магазинах — лише адміністратор
                .requestMatchers(HttpMethod.PUT, "/orders").hasAnyAuthority(STORE_ADMINISTRATOR.name())
                .requestMatchers("/stores/**", "/users/**").hasAuthority(STORE_ADMINISTRATOR.name())

                // Складські залишки, Продукти, Запаси в магазинах — менеджер складу
                .requestMatchers("/warehouse-stocks/**", "/warehouses/**").hasAuthority(WAREHOUSE_MANAGER.name())

                .requestMatchers("/products/**", "/stocks/**").hasAnyAuthority(WAREHOUSE_MANAGER.name(), STORE_ADMINISTRATOR.name())
                .anyRequest().authenticated()
        );

        http.sessionManagement(c -> c.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .csrf(AbstractHttpConfigurer::disable);

        http.oauth2ResourceServer(oauth2 -> oauth2
                .bearerTokenResolver(coockieBearerTokenResolver)
                .jwt(jwt -> jwt.jwtAuthenticationConverter(customJwtAuthenticationConverter::convert))
        );

        http.oauth2Login(oauth2 -> oauth2
                .authorizationEndpoint(endpoint -> endpoint
                        .authorizationRequestResolver(
                                new CustomAuthorizationRequestResolver(clientRegistrationRepository)
                        )
                )
                .userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
                .successHandler(oAuth2AuthenticationSuccessHandler)
        );

        return http.build();
    }
}
