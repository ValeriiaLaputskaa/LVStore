package org.example.lvstore.payload.store;

public record UpdateStoreRequest(
        Long id,
        String name,
        String location,
        Long adminId
) {
}
