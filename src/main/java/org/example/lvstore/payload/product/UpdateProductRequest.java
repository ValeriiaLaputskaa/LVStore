package org.example.lvstore.payload.product;

public record UpdateProductRequest(
        Long id,
        String name,
        String category,
        String barcode,
        Double price,
        String description
) {
}
