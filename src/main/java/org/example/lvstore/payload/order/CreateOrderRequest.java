package org.example.lvstore.payload.order;

import java.time.LocalDateTime;

public record CreateOrderRequest(
    String status,
    Integer quantity,
    LocalDateTime createdAt,
    Long productId,
    Long storeId,
    Long creatorId){
}
