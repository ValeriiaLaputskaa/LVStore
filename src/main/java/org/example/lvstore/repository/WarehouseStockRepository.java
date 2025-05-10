package org.example.lvstore.repository;

import org.example.lvstore.entity.WarehouseStock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WarehouseStockRepository extends JpaRepository<WarehouseStock, Long> {
    List<WarehouseStock> findByWarehouseId(Long warehouseId);
    List<WarehouseStock> findByProductId(Long productId);
}
