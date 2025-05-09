package org.example.lvstore.payload.user;

public record CreateUserRequest(
        String username,
        String password,
        String email,
        String role
) {
}
