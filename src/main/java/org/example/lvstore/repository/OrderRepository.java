package org.example.lvstore.repository;

import org.example.lvstore.entity.Order;
import org.example.lvstore.service.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStoreId(Long storeId);
    List<Order> findByStatus(OrderStatus status);
}
