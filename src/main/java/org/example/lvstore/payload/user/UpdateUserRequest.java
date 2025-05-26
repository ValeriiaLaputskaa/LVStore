package org.example.lvstore.payload.user;

public record UpdateUserRequest(
        Long id,
        String username,
        String email,
        String role
) {
}
