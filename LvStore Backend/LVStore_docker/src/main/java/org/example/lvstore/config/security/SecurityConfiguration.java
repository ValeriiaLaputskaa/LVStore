package org.example.lvstore.config.security;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UrlPathHelper;

import static org.example.lvstore.service.enums.Role.*;


@EnableWebSecurity
@EnableMethodSecurity
@Configuration
@RequiredArgsConstructor
public class SecurityConfiguration {

    private static final UrlPathHelper URL_PATH_HELPER = new UrlPathHelper();
    private static final RequestMatcher DOCS_ENDPOINTS =
            request -> isDocsEndpoint(pathWithinApplication(request));

    private final CoockieBearerTokenResolver coockieBearerTokenResolver;
    private final CustomJwtAuthenticationConverter customJwtAuthenticationConverter;
    private final ObjectProvider<ClientRegistrationRepository> clientRegistrationRepository;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final CustomOidcUserService customOidcUserService;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    private final OAuth2LoginFailureHandler oAuth2LoginFailureHandler;

    // Окремий chain без resource server — Swagger/OpenAPI має відкриватися навіть якщо в браузері є
    // "битий" token cookie (інакше BearerTokenAuthenticationFilter повертає 401 до permitAll()).
    @Bean
    @Order(0)
    public SecurityFilterChain publicDocsEndpoints(HttpSecurity http) throws Exception {
        http.securityMatcher(DOCS_ENDPOINTS)
                .authorizeHttpRequests(c -> c.anyRequest().permitAll())
                .sessionManagement(c -> c.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .cors(c -> {})
                .csrf(AbstractHttpConfigurer::disable);
        return http.build();
    }

    @Bean
    @Order(1)
    public SecurityFilterChain publicAuthEndpoints(HttpSecurity http) throws Exception {
        http.securityMatcher(new OrRequestMatcher(
                        antPath("/login"),
                        antPath(HttpMethod.POST, "/auth/token")
                ))
                .authorizeHttpRequests(c -> c.anyRequest().permitAll())
                .sessionManagement(c -> c.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .cors(c -> {})
                .csrf(AbstractHttpConfigurer::disable);
        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.securityMatcher(antPath("/**"));
        http.authorizeHttpRequests(c -> c
                .requestMatchers(antPath(HttpMethod.OPTIONS, "/**")).permitAll()
                .requestMatchers(antPath("/error")).permitAll()
                .requestMatchers(antPath("/login")).permitAll()
                .requestMatchers(antPath(HttpMethod.POST, "/auth/token")).permitAll()
                .requestMatchers(antPath("/oauth2/**"), antPath("/login/oauth2/**")).permitAll()
                .requestMatchers(DOCS_ENDPOINTS).permitAll()
                // Продавець
                .requestMatchers(antPath(HttpMethod.POST, "/orders")).hasAnyAuthority(SELLER.name(), STORE_ADMINISTRATOR.name()) // створення замовлення
                .requestMatchers(antPath(HttpMethod.PUT, "/orders/*/deliver")).hasAnyAuthority(SELLER.name(), STORE_ADMINISTRATOR.name()) // підтвердження отримання

                // Менеджер складу
                .requestMatchers(antPath(HttpMethod.PUT, "/orders/*/cancel")).hasAnyAuthority(WAREHOUSE_MANAGER.name(), STORE_ADMINISTRATOR.name())
                .requestMatchers(antPath(HttpMethod.PUT, "/orders/*/ship")).hasAuthority(WAREHOUSE_MANAGER.name())

                // Адміністратор магазину
                .requestMatchers(antPath(HttpMethod.PUT, "/orders/*/confirm")).hasAuthority(STORE_ADMINISTRATOR.name())

                // Усі користувачі, які мають доступ до перегляду замовлень
                .requestMatchers(antPath(HttpMethod.GET, "/orders"), antPath(HttpMethod.GET, "/orders/**")).hasAnyAuthority(
                        SELLER.name(), STORE_ADMINISTRATOR.name(), WAREHOUSE_MANAGER.name()
                )

                // Інші доступи, що залежать від ролі:
                // Склади, Продукти, Користувачі, Запаси в магазинах — лише адміністратор
                .requestMatchers(
                        exactEndpoint(HttpMethod.GET, "/products"),
                        endpointWithOnlyParam(HttpMethod.GET, "/products", "barcode"),
                        numericIdEndpoint(HttpMethod.GET, "/products")
                ).hasAnyAuthority(SELLER.name(), WAREHOUSE_MANAGER.name(), STORE_ADMINISTRATOR.name())
                .requestMatchers(
                        exactEndpoint(HttpMethod.GET, "/stocks"),
                        numericIdEndpoint(HttpMethod.GET, "/stocks"),
                        endpointWithOnlyParam(HttpMethod.GET, "/stocks/critical", "storeId"),
                        exactEndpoint(HttpMethod.PUT, "/stocks")
                ).hasAnyAuthority(SELLER.name(), WAREHOUSE_MANAGER.name(), STORE_ADMINISTRATOR.name())
                .requestMatchers(
                        exactEndpoint(HttpMethod.GET, "/stores"),
                        numericIdEndpoint(HttpMethod.GET, "/stores")
                ).hasAnyAuthority(SELLER.name(), STORE_ADMINISTRATOR.name())

                .requestMatchers(antPath(HttpMethod.PUT, "/orders")).hasAnyAuthority(STORE_ADMINISTRATOR.name())
                .requestMatchers(antPath("/stores/**"), antPath("/users/**")).hasAuthority(STORE_ADMINISTRATOR.name())

                // Складські залишки, Продукти, Запаси в магазинах — менеджер складу
                .requestMatchers(antPath("/warehouse-stocks/**"), antPath("/warehouses/**")).hasAuthority(WAREHOUSE_MANAGER.name())

                .requestMatchers(antPath("/products/**"), antPath("/stocks/**")).hasAnyAuthority(WAREHOUSE_MANAGER.name(), STORE_ADMINISTRATOR.name())
                .anyRequest().authenticated()
        );

        // OAuth2 authorization code flow потребує сесії для збереження state між редиректами;
        // JWT resource server для API лишається без змін.
        ClientRegistrationRepository registrations = clientRegistrationRepository.getIfAvailable();
        SessionCreationPolicy sessionPolicy =
                registrations != null ? SessionCreationPolicy.IF_REQUIRED : SessionCreationPolicy.STATELESS;
        http.sessionManagement(c -> c.sessionCreationPolicy(sessionPolicy))
                .cors(c -> {})
                .csrf(AbstractHttpConfigurer::disable);

        http.oauth2ResourceServer(oauth2 -> oauth2
                .bearerTokenResolver(coockieBearerTokenResolver)
                .jwt(jwt -> jwt.jwtAuthenticationConverter(customJwtAuthenticationConverter::convert))
        );

        // Google OAuth2 login — лише якщо задано client id/secret (див. application.properties).
        if (registrations != null) {
            http.oauth2Login(oauth2 -> oauth2
                    .authorizationEndpoint(endpoint -> endpoint
                            .authorizationRequestResolver(new CustomAuthorizationRequestResolver(registrations))
                    )
                    .userInfoEndpoint(userInfo -> userInfo
                            .userService(customOAuth2UserService)
                            .oidcUserService(customOidcUserService)
                    )
                    .successHandler(oAuth2AuthenticationSuccessHandler)
                    .failureHandler(oAuth2LoginFailureHandler)
            );
        }

        return http.build();
    }

    private static String pathWithinApplication(HttpServletRequest request) {
        String path = URL_PATH_HELPER.getPathWithinApplication(request);
        if (!StringUtils.hasText(path)) {
            return "/";
        }
        if (path.length() > 1 && path.endsWith("/")) {
            return path.substring(0, path.length() - 1);
        }
        return path;
    }

    private static boolean isDocsEndpoint(String path) {
        return "/swagger-ui.html".equals(path)
                || "/swagger-ui".equals(path)
                || path.startsWith("/swagger-ui/")
                || "/api-docs".equals(path)
                || path.startsWith("/api-docs/")
                || "/v3/api-docs".equals(path)
                || path.startsWith("/v3/api-docs/");
    }

    private static RequestMatcher antPath(String pattern) {
        return new AntPathRequestMatcher(pattern);
    }

    private static RequestMatcher antPath(HttpMethod method, String pattern) {
        return new AntPathRequestMatcher(pattern, method.name());
    }

    private static RequestMatcher exactEndpoint(HttpMethod method, String path) {
        return request -> methodMatches(method, request)
                && path.equals(pathWithinApplication(request))
                && request.getParameterMap().isEmpty();
    }

    private static RequestMatcher endpointWithOnlyParam(HttpMethod method, String path, String paramName) {
        return request -> methodMatches(method, request)
                && path.equals(pathWithinApplication(request))
                && request.getParameterMap().size() == 1
                && request.getParameterMap().containsKey(paramName);
    }

    private static RequestMatcher numericIdEndpoint(HttpMethod method, String basePath) {
        return request -> {
            if (!methodMatches(method, request) || !request.getParameterMap().isEmpty()) {
                return false;
            }

            String path = pathWithinApplication(request);
            String prefix = basePath + "/";
            if (!path.startsWith(prefix)) {
                return false;
            }

            String id = path.substring(prefix.length());
            return StringUtils.hasText(id)
                    && !id.contains("/")
                    && id.chars().allMatch(Character::isDigit);
        };
    }

    private static boolean methodMatches(HttpMethod method, HttpServletRequest request) {
        return method.name().equals(request.getMethod());
    }
}
