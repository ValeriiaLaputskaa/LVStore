package org.example.lvstore.payload.stock;

public record CreateStockRequest(
        Long productId,
        Long storeId,
        Integer quantity,
        Integer minQuantity
) {
}
