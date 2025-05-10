package org.example.lvstore.payload.warehousestock;

public record CreateWarehouseStockRequest(
        Long warehouseId,
        Long productId,
        Integer quantity
) {
}
