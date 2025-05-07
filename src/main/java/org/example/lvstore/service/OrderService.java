package org.example.lvstore.service;

import lombok.RequiredArgsConstructor;
import org.example.lvstore.entity.Order;
import org.example.lvstore.entity.Product;
import org.example.lvstore.entity.Store;
import org.example.lvstore.entity.User;
import org.example.lvstore.payload.order.CreateOrderRequest;
import org.example.lvstore.payload.order.UpdateOrderRequest;
import org.example.lvstore.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductService productService;
    private final StoreService storeService;
    private final UserService userService;

    public Order createOrder(CreateOrderRequest createOrderRequest) {
        Order order = Order.builder()
                .status(createOrderRequest.status())
                .quantity(createOrderRequest.quantity())
                .createdAt(createOrderRequest.createdAt())
                .product(productService.getProductById(createOrderRequest.productId()))
                .store(storeService.getStoreById(createOrderRequest.storeId()))
                .createdBy(userService.getUserById(createOrderRequest.creatorId()))
                .build();
        return orderRepository.save(order);
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(String.format("Order with id %s not found", id)));
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByStoreId(Long storeId) {
        return orderRepository.findByStoreId(storeId);
    }

    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.findByStatus(status);
    }

    public Order updateOrder(UpdateOrderRequest updateOrderRequest) {

        Order order = getOrderById(updateOrderRequest.id());
        Product product = productService.getProductById(updateOrderRequest.productId());
        Store store = storeService.getStoreById(updateOrderRequest.storeId());
        User creator = userService.getUserById(updateOrderRequest.creatorId());

        order.setStatus(updateOrderRequest.status());
        order.setQuantity(updateOrderRequest.quantity());
        order.setCreatedAt(updateOrderRequest.createdAt());
        order.setProduct(product);
        order.setStore(store);
        order.setCreatedBy(creator);

        return orderRepository.save(order);
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
}
