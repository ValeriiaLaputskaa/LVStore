package org.example.lvstore.service;

import lombok.RequiredArgsConstructor;
import org.example.lvstore.entity.Order;
import org.example.lvstore.entity.Product;
import org.example.lvstore.entity.Store;
import org.example.lvstore.entity.User;
import org.example.lvstore.payload.order.CreateOrderRequest;
import org.example.lvstore.payload.order.UpdateOrderRequest;
import org.example.lvstore.repository.OrderRepository;
import org.example.lvstore.service.enams.OrderStatus;
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
    private final StockService stockService;

    public Order createOrder(CreateOrderRequest createOrderRequest) {
        Order order = Order.builder()
                .status(OrderStatus.valueOf(createOrderRequest.status()))
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

    public Order confirmOrder(Long id) {
        Order order = getOrderById(id);
        if (order.getStatus() != OrderStatus.NEW) {
            throw new IllegalStateException("Only NEW orders can be confirmed");
        }
        order.setStatus(OrderStatus.CONFIRMED);
        return orderRepository.save(order);
    }

    public Order cancelOrder(Long id) {
        Order order = getOrderById(id);
        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.RECEIVED) {
            throw new IllegalStateException("Cannot cancel order in this state");
        }
        order.setStatus(OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }

    public Order shipOrder(Long id) {
        Order order = getOrderById(id);
        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Only CONFIRMED orders can be shipped");
        }

        boolean inStock = stockService.isInStock(order.getProduct().getId(), order.getStore().getId(), order.getQuantity());
        if (!inStock) {
            throw new IllegalStateException("Not enough stock to ship order");
        }

        stockService.decreaseStock(order.getProduct().getId(), order.getStore().getId(), order.getQuantity());
        order.setStatus(OrderStatus.SHIPPED);
        return orderRepository.save(order);
    }

    public Order markAsDelivered(Long id) {
        Order order = getOrderById(id);
        if (order.getStatus() != OrderStatus.SHIPPED) {
            throw new IllegalStateException("Only SHIPPED orders can be marked as delivered");
        }
        order.setStatus(OrderStatus.RECEIVED);
        return orderRepository.save(order);
    }
}
