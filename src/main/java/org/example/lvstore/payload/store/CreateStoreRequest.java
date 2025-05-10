package org.example.lvstore.payload.store;

public record CreateStoreRequest(
        String name,
        String location,
        Long adminId
) {
}
