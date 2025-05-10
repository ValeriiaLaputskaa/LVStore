package org.example.lvstore.repository;

import org.example.lvstore.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockRepository extends JpaRepository<Stock, Long> {
    List<Stock> findByStoreId(Long storeId);
    List<Stock> findByProductId(Long productId);
}

