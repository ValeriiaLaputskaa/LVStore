package org.example.lvstore.repository;

import org.example.lvstore.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, Long> {
    List<Stock> findByStoreId(Long storeId);
    List<Stock> findByProductId(Long productId);
    Optional<Stock> findByProductIdAndStoreId(Long productId, Long storeId);
}

