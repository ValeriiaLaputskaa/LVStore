package org.example.lvstore.payload.user;

public record CreateUserRequest(
        String username,
        String email,
        String role
) {
}
