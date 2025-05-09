package org.example.lvstore.repository;

import org.example.lvstore.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsByBarcode(String barcode);
    Optional<Product> findByBarcode(String barcode);
}
