package org.example.lvstore.controller;

import lombok.RequiredArgsConstructor;
import org.example.lvstore.entity.Order;
import org.example.lvstore.payload.order.CreateOrderRequest;
import org.example.lvstore.payload.order.UpdateOrderRequest;
import org.example.lvstore.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Order> createOrder(@RequestBody CreateOrderRequest createOrderRequest) {
        return ResponseEntity.ok(orderService.createOrder(createOrderRequest));
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping(params = "storeId")
    public ResponseEntity<List<Order>> getOrdersByStoreId(@RequestParam Long storeId) {
        return ResponseEntity.ok(orderService.getOrdersByStoreId(storeId));
    }

    @GetMapping(params = "status")
    public ResponseEntity<List<Order>> getOrdersByStatus(@RequestParam String status) {
        return ResponseEntity.ok(orderService.getOrdersByStatus(status));
    }

    @PutMapping
    public ResponseEntity<Order> updateOrder(@RequestBody UpdateOrderRequest updateOrderRequest) {
        try {
            Order updatedOrder = orderService.updateOrder(updateOrderRequest);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
    }
}
