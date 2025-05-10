package org.example.lvstore.payload.stock;

public record UpdateStockRequest(
        Long id,
        Long productId,
        Long storeId,
        Integer quantity
) {
}
