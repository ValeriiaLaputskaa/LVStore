package org.example.lvstore.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.lvstore.entity.Order;
import org.example.lvstore.entity.Product;
import org.example.lvstore.entity.Store;
import org.example.lvstore.entity.User;
import org.example.lvstore.payload.order.CreateOrderRequest;
import org.example.lvstore.repository.OrderRepository;
import org.example.lvstore.repository.ProductRepository;
import org.example.lvstore.repository.StoreRepository;
import org.example.lvstore.repository.UserRepository;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
                    .password("secret")
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
                    .password("secret")
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
}
