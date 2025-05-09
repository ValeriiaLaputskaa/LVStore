package org.example.lvstore.payload.user;

public record UpdateUserRequest(
        Long id,
        String username,
        String password,
        String email,
        String role
) {
}
