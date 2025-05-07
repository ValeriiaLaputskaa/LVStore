package org.example.lvstore.payload.order;

import java.time.LocalDateTime;

public record UpdateOrderRequest(
        Long id,
        String status,
        Integer quantity,
        LocalDateTime createdAt,
        Long productId,
        Long storeId,
        Long creatorId
) {
}
