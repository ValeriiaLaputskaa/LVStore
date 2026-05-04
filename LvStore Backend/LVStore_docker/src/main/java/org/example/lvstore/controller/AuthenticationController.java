package org.example.lvstore.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.lvstore.entity.User;
import org.example.lvstore.service.JwtService;
import org.example.lvstore.service.UserService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AuthenticationController {

    private final JwtService jwtService;
    private final UserService userService;

    /** JSON-підказка для API-клієнтів; браузерний вхід через Google — GET `/oauth2/authorization/google`. */
    @GetMapping(value = "/login", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, String>> login() {
        return ResponseEntity.ok(Map.of(
                "message",
                "Use POST /auth/token for email/password login or navigate to /oauth2/authorization/google for Google OAuth2 (user must already exist in DB)."
        ));
    }

    public record TokenRequest(String email, String password) {
    }

    /** JWT за email/паролем; користувач має бути в БД. */
    @PostMapping("/auth/token")
    public Map<String, String> issueToken(@RequestBody TokenRequest body, HttpServletResponse response) {
        String email = body != null ? body.email() : null;
        String password = body != null ? body.password() : null;
        User user = userService.authenticateByEmailAndPassword(email, password);
        String token = jwtService.generateToken(user);

        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge((int) Duration.ofDays(7).getSeconds());
        response.addCookie(cookie);

        return Map.of("token", token);
    }

    public record MeResponse(Long id, String email, String username, String role) {
    }

    @GetMapping("/auth/me")
    public MeResponse me(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        return new MeResponse(user.getId(), user.getEmail(), user.getUsername(), user.getRole().name());
    }

    @PostMapping("/auth/logout")
    public Map<String, Object> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("token", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return Map.of("ok", true);
    }
}
