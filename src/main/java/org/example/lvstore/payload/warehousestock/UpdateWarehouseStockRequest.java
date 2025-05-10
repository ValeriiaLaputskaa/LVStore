package org.example.lvstore.payload.warehousestock;

public record UpdateWarehouseStockRequest(
        Long id,
        Long warehouseId,
        Long productId,
        Integer quantity
) {
}
