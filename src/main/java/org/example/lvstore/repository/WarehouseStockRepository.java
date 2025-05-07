package org.example.lvstore.repository;

import org.example.lvstore.entity.WarehouseStock;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WarehouseStockRepository extends JpaRepository<WarehouseStock, Long> {
}
