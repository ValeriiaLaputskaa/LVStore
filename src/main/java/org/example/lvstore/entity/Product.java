package org.example.lvstore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String category;

    @Column(unique = true)
    private String barcode;

    private Double price;

    @Column(columnDefinition = "TEXT")
    private String description;
}
