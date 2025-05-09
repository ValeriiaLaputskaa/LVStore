package org.example.lvstore.payload.product;

public record CreateProductRequest(
        String name,
        String category,
        String barcode,
        Double price,
        String description
) {
}
