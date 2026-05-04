package org.example.lvstore.config.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.lvstore.entity.User;
import org.example.lvstore.service.JwtService;
import org.example.lvstore.service.UserService;
import org.example.lvstore.service.enums.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.time.Duration;
import java.util.NoSuchElementException;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserService userService;

    @Value("${lvstore.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = oauth2User.getAttribute("email");
        if (!StringUtils.hasText(email)) {
            response.sendRedirect(frontendBaseUrl + "/login?oauth2=access_denied");
            return;
        }

        User user;
        try {
            user = userService.getUserByEmail(email);
        } catch (NoSuchElementException ex) {
            response.sendRedirect(frontendBaseUrl + "/login?oauth2=access_denied");
            return;
        }

        String token = jwtService.generateToken(user);

        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge((int) Duration.ofDays(7).getSeconds());
        response.addCookie(cookie);

        response.sendRedirect(frontendBaseUrl + redirectPathFor(user.getRole()));
    }

    private static String redirectPathFor(Role role) {
        return switch (role) {
            case STORE_ADMINISTRATOR -> "/admin/dashboard";
            case SELLER -> "/seller/products";
            case WAREHOUSE_MANAGER -> "/warehouse/dashboard";
        };
    }
}
