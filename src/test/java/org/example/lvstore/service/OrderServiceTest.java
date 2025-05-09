package org.example.lvstore.service;

import org.example.lvstore.entity.Order;
import org.example.lvstore.entity.Product;
import org.example.lvstore.entity.Store;
import org.example.lvstore.entity.User;
import org.example.lvstore.payload.order.CreateOrderRequest;
import org.example.lvstore.payload.order.UpdateOrderRequest;
import org.example.lvstore.repository.OrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private ProductService productService;
    @Mock
    private StoreService storeService;
    @Mock
    private UserService userService;
    @InjectMocks
    private OrderService orderService;

    @Test
    void testCreateOrder_Success() {
        CreateOrderRequest request = new CreateOrderRequest(
                "NEW",
                5,
                LocalDateTime.now(),
                1L,
                2L,
                3L
        );

        Product mockProduct = new Product();
        Store mockStore = new Store();
        User mockUser = new User();

        Order expectedOrder = Order.builder()
                .status("NEW")
                .quantity(5)
                .product(mockProduct)
                .store(mockStore)
                .createdBy(mockUser)
                .build();

        when(productService.getProductById(1L)).thenReturn(mockProduct);
        when(storeService.getStoreById(2L)).thenReturn(mockStore);
        when(userService.getUserById(3L)).thenReturn(mockUser);
        when(orderRepository.save(any(Order.class))).thenReturn(expectedOrder);

        Order actualOrder = orderService.createOrder(request);

        assertNotNull(actualOrder);
        assertEquals("NEW", actualOrder.getStatus());
        assertEquals(5, actualOrder.getQuantity());
        assertEquals(mockProduct, actualOrder.getProduct());
        assertEquals(mockStore, actualOrder.getStore());
        assertEquals(mockUser, actualOrder.getCreatedBy());

        verify(productService, times(1)).getProductById(1L);
        verify(storeService, times(1)).getStoreById(2L);
        verify(userService, times(1)).getUserById(3L);
        verify(orderRepository, times(1)).save(any(Order.class));
    }


    @Test
    void testUpdateOrder_Success() {
        UpdateOrderRequest request = new UpdateOrderRequest(
                1L, "UPDATED", 10, LocalDateTime.now(), 1L, 2L, 3L
        );

        Order existingOrder = new Order();
        Product product = new Product();
        Store store = new Store();
        User user = new User();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(existingOrder));
        when(productService.getProductById(1L)).thenReturn(product);
        when(storeService.getStoreById(2L)).thenReturn(store);
        when(userService.getUserById(3L)).thenReturn(user);
        when(orderRepository.save(any(Order.class))).thenReturn(existingOrder);

        Order updated = orderService.updateOrder(request);

        assertEquals("UPDATED", updated.getStatus());
        assertEquals(10, updated.getQuantity());
        assertEquals(product, updated.getProduct());
        assertEquals(store, updated.getStore());
        assertEquals(user, updated.getCreatedBy());
        verify(orderRepository, times(1)).save(existingOrder);
    }

    @Test
    void testUpdateOrder_Failure() {
        UpdateOrderRequest request = new UpdateOrderRequest(
                404L, "ERROR", 1, LocalDateTime.now(), 1L, 1L, 1L
        );
        when(orderRepository.findById(404L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> orderService.updateOrder(request));
        verify(orderRepository, times(0)).save(any(Order.class));
    }

    @Test
    void testGetOrderById_Success() {
        Order mockOrder = new Order();
        when(orderRepository.findById(1L)).thenReturn(Optional.of(mockOrder));

        Order result = orderService.getOrderById(1L);
        assertEquals(mockOrder, result);
        verify(orderRepository, times(1)).findById(1L);
    }

    @Test
    void testGetOrderById_Failure() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());

        NoSuchElementException exception = assertThrows(
                NoSuchElementException.class,
                () -> orderService.getOrderById(999L)
        );

        assertEquals("Order with id 999 not found", exception.getMessage());
    }

    @Test
    void testGetAllOrders_Success() {
        Order o1 = new Order();
        Order o2 = new Order();
        when(orderRepository.findAll()).thenReturn(List.of(o1, o2));

        List<Order> orders = orderService.getAllOrders();
        assertEquals(2, orders.size());
        verify(orderRepository, times(1)).findAll();
    }

    @Test
    void testGetOrdersByStoreId_Success() {
        Order o1 = new Order();
        Order o2 = new Order();
        when(orderRepository.findByStoreId(5L)).thenReturn(List.of(o1, o2));

        List<Order> result = orderService.getOrdersByStoreId(5L);
        assertEquals(2, result.size());
        verify(orderRepository, times(1)).findByStoreId(5L);
    }

    @Test
    void testGetOrdersByStatus_Success() {
        Order o = new Order();
        when(orderRepository.findByStatus("PENDING")).thenReturn(List.of(o));

        List<Order> result = orderService.getOrdersByStatus("PENDING");
        assertEquals(1, result.size());
        verify(orderRepository, times(1)).findByStatus("PENDING");
    }

    @Test
    void testDeleteOrder_Success() {
        doNothing().when(orderRepository).deleteById(10L);
        orderService.deleteOrder(10L);
        verify(orderRepository, times(1)).deleteById(10L);
    }
}
