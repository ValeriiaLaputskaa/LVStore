package org.example.lvstore.payload.warehouse;

public record UpdateWarehouseRequest(
        Long id,
        String name,
        String location,
        Long managerId
) {
}
