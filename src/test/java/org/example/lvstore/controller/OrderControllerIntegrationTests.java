package org.example.lvstore.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.lvstore.entity.*;
import org.example.lvstore.payload.order.CreateOrderRequest;
import org.example.lvstore.repository.*;
import org.example.lvstore.service.enums.OrderStatus;
import org.example.lvstore.service.enums.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class OrderControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private StockRepository stockRepository;

    @Test
    @WithMockUser(authorities = "STORE_ADMINISTRATOR")
    void createOrder_Success_AsStoreAdministrator() throws Exception {
        Long orderId = null;
        Long userId = null;
        Long productId = null;
        Long storeId = null;
        try {
            User admin = userRepository.save(User.builder()
                    .email("admin@store.com")
                    .role(Role.STORE_ADMINISTRATOR)
                    .username("Admin Name")
                    .build());

            Store store = storeRepository.save(Store.builder()
                    .name("Main Store")
                    .location("Main St")
                    .admin(admin)
                    .build());

            Product product = productRepository.save(Product.builder()
                    .name("Monitor")
                    .description("24-inch Monitor")
                    .price(250.0)
                    .build());

            userId = admin.getId();
            storeId = store.getId();
            productId = product.getId();
            CreateOrderRequest request = new CreateOrderRequest(
                    OrderStatus.NEW.name(),
                    5,
                    LocalDateTime.now(),
                    productId,
                    storeId,
                    userId
            );

            String response = mockMvc.perform(post("/orders")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.status").value("NEW"))
                    .andExpect(jsonPath("$.quantity").value(5))
                    .andReturn().getResponse().getContentAsString();

            Order created = objectMapper.readValue(response, Order.class);
            orderId = created.getId();

            assertThat(created.getProduct().getId()).isEqualTo(product.getId());
            assertThat(created.getStore().getId()).isEqualTo(store.getId());
            assertThat(created.getCreatedBy().getId()).isEqualTo(admin.getId());

        } finally {
            if (orderId != null && userId != null && productId != null && storeId != null) {
                orderRepository.deleteById(orderId);
                userRepository.deleteById(userId);
                storeRepository.deleteById(storeId);
                productRepository.deleteById(productId);
            }
        }
    }

    @Test
    @WithMockUser(authorities = "WAREHOUSE_MANAGER")
    void createOrder_Forbidden_AsWarehouseManager() throws Exception {
        Long userId = null;
        Long productId = null;
        Long storeId = null;
        try {
            User warehouseManager = userRepository.save(User.builder()
                    .email("warehouseManager@store.com")
                    .role(Role.WAREHOUSE_MANAGER)
                    .username("Manager Name")
                    .build());

            Store store = storeRepository.save(Store.builder()
                    .name("Main Store")
                    .location("Main St")
                    .admin(warehouseManager)
                    .build());

            Product product = productRepository.save(Product.builder()
                    .name("Monitor")
                    .description("24-inch Monitor")
                    .price(250.0)
                    .build());

            userId = warehouseManager.getId();
            storeId = store.getId();
            productId = product.getId();
            CreateOrderRequest request = new CreateOrderRequest(
                    OrderStatus.NEW.name(),
                    5,
                    LocalDateTime.now(),
                    productId,
                    storeId,
                    userId
            );

            mockMvc.perform(post("/orders")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());

        } finally {
            if (userId != null && productId != null && storeId != null) {
                userRepository.deleteById(userId);
                storeRepository.deleteById(storeId);
                productRepository.deleteById(productId);
            }
        }
    }

    @Test
    @WithMockUser(authorities = "STORE_ADMINISTRATOR")
    void confirmOrder_Success_AsStoreAdministrator() throws Exception {
        Long orderId = null;
        Long userId = null;
        Long productId = null;
        Long storeId = null;
        try {
            User admin = userRepository.save(User.builder()
                    .email("admin@store.com")
                    .role(Role.STORE_ADMINISTRATOR)
                    .username("Admin Name")
                    .build());

            Store store = storeRepository.save(Store.builder()
                    .name("Main Store")
                    .location("Main St")
                    .admin(admin)
                    .build());

            Product product = productRepository.save(Product.builder()
                    .name("Tablet")
                    .description("10-inch Android Tablet")
                    .price(300.0)
                    .build());

            Order order = orderRepository.save(Order.builder()
                    .status(OrderStatus.NEW)
                    .quantity(2)
                    .createdAt(LocalDateTime.now())
                    .product(product)
                    .store(store)
                    .createdBy(admin)
                    .build());

            userId = admin.getId();
            storeId = store.getId();
            productId = product.getId();
            orderId = order.getId();

            mockMvc.perform(put("/orders/" + orderId + "/confirm"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("CONFIRMED"));

            Order updated = orderRepository.findById(orderId).orElseThrow();
            assertThat(updated.getStatus()).isEqualTo(OrderStatus.CONFIRMED);

        } finally {
            if (orderId != null && userId != null && productId != null && storeId != null) {
                orderRepository.deleteById(orderId);
                userRepository.deleteById(userId);
                storeRepository.deleteById(storeId);
                productRepository.deleteById(productId);
            }
        }
    }

    @Test
    @WithMockUser(authorities = "WAREHOUSE_MANAGER")
    void shipConfirmedOrder_IfStockAvailable_ThenShipped() throws Exception {
        Long userId = null;
        Long productId = null;
        Long storeId = null;
        Long warehouseId = null;
        Long stockId = null;
        Long orderId = null;
        try {
            User manager = userRepository.save(User.builder()
                    .email("manager@warehouse.com")
                    .role(Role.WAREHOUSE_MANAGER)
                    .username("Warehouse Manager")
                    .build());

            Warehouse warehouse = warehouseRepository.save(Warehouse.builder()
                    .name("Central Warehouse")
                    .location("Industrial Zone")
                    .build());

            Store store = storeRepository.save(Store.builder()
                    .name("Local Store")
                    .location("Main Street")
                    .admin(manager)
                    .build());

            Product product = productRepository.save(Product.builder()
                    .name("Printer")
                    .description("Laser Printer")
                    .price(150.0)
                    .build());

            Stock stock = stockRepository.save(Stock.builder()
                    .product(product)
                    .store(store)
                    .quantity(10)
                    .build());

            Order order = orderRepository.save(Order.builder()
                    .status(OrderStatus.CONFIRMED)
                    .quantity(5)
                    .createdAt(LocalDateTime.now())
                    .product(product)
                    .store(store)
                    .createdBy(manager)
                    .build());

            userId = manager.getId();
            storeId = store.getId();
            productId = product.getId();
            warehouseId = warehouse.getId();
            stockId = stock.getId();
            orderId = order.getId();

            mockMvc.perform(get("/orders")
                            .param("status", "CONFIRMED"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].status").value("CONFIRMED"))
                    .andExpect(jsonPath("$[0].quantity").value(5));

            mockMvc.perform(put("/orders/" + orderId + "/ship"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("SHIPPED"));

            Order updatedOrder = orderRepository.findById(orderId).orElseThrow();
            Stock updatedStock = stockRepository.findById(stockId).orElseThrow();

            assertThat(updatedOrder.getStatus()).isEqualTo(OrderStatus.SHIPPED);
            assertThat(updatedStock.getQuantity()).isEqualTo(5);

        } finally {
            if (orderId != null && userId != null && productId != null && storeId != null && warehouseId != null && stockId != null) {
                orderRepository.deleteById(orderId);
                stockRepository.deleteById(stockId);
                userRepository.deleteById(userId);
                productRepository.deleteById(productId);
                storeRepository.deleteById(storeId);
                warehouseRepository.deleteById(warehouseId);
            }
        }
    }

    @Test
    @WithMockUser(authorities = "STORE_ADMINISTRATOR")
    void markOrderAsDelivered_Success_AsStoreAdministrator() throws Exception {
        Long orderId = null;
        Long userId = null;
        Long productId = null;
        Long storeId = null;
        Long stockId = null;
        try {
            User admin = userRepository.save(User.builder()
                    .email("admin@store.com")
                    .role(Role.STORE_ADMINISTRATOR)
                    .username("Store Admin")
                    .build());

            Store store = storeRepository.save(Store.builder()
                    .name("Main Store")
                    .location("Central")
                    .admin(admin)
                    .build());

            Product product = productRepository.save(Product.builder()
                    .name("Laptop")
                    .description("Gaming laptop")
                    .price(1200.0)
                    .build());

            Stock stock = stockRepository.save(Stock.builder()
                    .product(product)
                    .store(store)
                    .quantity(0)
                    .build());

            Order order = orderRepository.save(Order.builder()
                    .product(product)
                    .store(store)
                    .createdBy(admin)
                    .createdAt(LocalDateTime.now())
                    .quantity(5)
                    .status(OrderStatus.SHIPPED)
                    .build());

            orderId = order.getId();
            userId = admin.getId();
            productId = product.getId();
            storeId = store.getId();
            stockId = stock.getId();

            mockMvc.perform(put("/orders/" + orderId + "/deliver"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("RECEIVED"));

            Order updated = orderRepository.findById(orderId).orElseThrow();
            assertThat(updated.getStatus()).isEqualTo(OrderStatus.RECEIVED);

        } finally {
            if (orderId != null && userId != null && productId != null && storeId != null && stockId != null) {
                orderRepository.deleteById(orderId);
                userRepository.deleteById(userId);
                storeRepository.deleteById(storeId);
                productRepository.deleteById(productId);
                stockRepository.deleteById(stockId);
            }
        }
    }
}
