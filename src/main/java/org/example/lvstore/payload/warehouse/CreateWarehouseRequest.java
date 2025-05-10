package org.example.lvstore.payload.warehouse;

public record CreateWarehouseRequest(
        String name,
        String location,
        Long managerId
) {
}
