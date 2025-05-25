package org.example.lvstore.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.lvstore.entity.Product;
import org.example.lvstore.payload.product.CreateProductRequest;
import org.example.lvstore.payload.product.UpdateProductRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class ProductControllerIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(authorities = "STORE_ADMINISTRATOR")
    void createProduct_Success_AsAdmin() throws Exception {
        Long productId = null;
        try {
            CreateProductRequest request = new CreateProductRequest(
                    "Laptop",
                    "Electronics",
                    "1234567890999",
                    1500.0,
                    "High-performance laptop"
            );

            String response = mockMvc.perform(post("/products")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.name").value("Laptop"))
                    .andExpect(jsonPath("$.barcode").value("1234567890999"))
                    .andReturn().getResponse().getContentAsString();

            Product created = objectMapper.readValue(response, Product.class);
            productId = created.getId();
        } finally {
            if (productId != null) {
                mockMvc.perform(delete("/products/" + productId))
                        .andExpect(status().isNoContent());
            }
        }
    }

    @Test
    @WithMockUser(authorities = "SELLER")
    void createProduct_Forbidden_AsSeller() throws Exception {
        CreateProductRequest request = new CreateProductRequest(
                "Laptop",
                "Electronics",
                "1234567890123",
                1500.0,
                "High-performance laptop"
        );

        mockMvc.perform(post("/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(authorities = "STORE_ADMINISTRATOR")
    void createProduct_ProductExists_AsAdmin() throws Exception {
        Long productId = null;
        try {
            // Створення продукту
            CreateProductRequest request = new CreateProductRequest(
                    "Laptop",
                    "Electronics",
                    "1234567890333",
                    1500.0,
                    "High-performance laptop"
            );

            String response = mockMvc.perform(post("/products")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andReturn().getResponse().getContentAsString();

            Product created = objectMapper.readValue(response, Product.class);
            productId = created.getId();

            // Повторне створення з тим самим штрихкодом
            mockMvc.perform(post("/products")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict());
        } finally {
            if (productId != null) {
                mockMvc.perform(delete("/products/" + productId))
                        .andExpect(status().isNoContent());
            }
        }
    }

    @Test
    @WithMockUser(authorities = "STORE_ADMINISTRATOR")
    void updateProduct_Success_AsAdmin() throws Exception {
        Long productId = null;
        try {
            CreateProductRequest createRequest = new CreateProductRequest(
                    "Apple", "Fruit", "123456711111111", 23.0, "Delicious"
            );

            String createResponse = mockMvc.perform(post("/products")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createRequest)))
                    .andExpect(status().isCreated())
                    .andReturn().getResponse().getContentAsString();

            Product created = objectMapper.readValue(createResponse, Product.class);
            productId = created.getId();

            UpdateProductRequest updateRequest = new UpdateProductRequest(
                    productId, "Updated name", "Test", "123456711111111", 199.99, "Test"
            );

            mockMvc.perform(put("/products")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Updated name"))
                    .andExpect(jsonPath("$.price").value(199.99));
        } finally {
            if (productId != null) {
                mockMvc.perform(delete("/products/" + productId))
                        .andExpect(status().isNoContent());
            }
        }
    }

    @Test
    @WithMockUser(authorities = "STORE_ADMINISTRATOR")
    void updateProduct_NotFound_ShouldReturn404() throws Exception {
        UpdateProductRequest request = new UpdateProductRequest(
                9999L, "Невідомий", "Категорія", "0000000000000", 10.0, "Опис"
        );

        mockMvc.perform(put("/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(authorities = "STORE_ADMINISTRATOR")
    void updateProduct_BarcodeConflict_ShouldReturn409() throws Exception {
        Long id1 = null, id2 = null;
        try {
            // Створюємо два продукти
            CreateProductRequest product1 = new CreateProductRequest("Product1", "Test", "barcode111", 20.0, "Desc");
            CreateProductRequest product2 = new CreateProductRequest("Product2", "Test", "barcode222", 30.0, "Desc");

            String response1 = mockMvc.perform(post("/products")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(product1)))
                    .andExpect(status().isCreated())
                    .andReturn().getResponse().getContentAsString();
            id1 = objectMapper.readValue(response1, Product.class).getId();

            String response2 = mockMvc.perform(post("/products")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(product2)))
                    .andExpect(status().isCreated())
                    .andReturn().getResponse().getContentAsString();
            id2 = objectMapper.readValue(response2, Product.class).getId();

            // Оновлюємо 2-й продукт, використовуючи штрихкод 1-го
            UpdateProductRequest updateRequest = new UpdateProductRequest(id2, "New", "Cat", "barcode111", 50.0, "New");

            mockMvc.perform(put("/products")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateRequest)))
                    .andExpect(status().isConflict());
        } finally {
            if (id1 != null) mockMvc.perform(delete("/products/" + id1)).andExpect(status().isNoContent());
            if (id2 != null) mockMvc.perform(delete("/products/" + id2)).andExpect(status().isNoContent());
        }
    }

    @Test
    @WithMockUser(authorities = "SELLER")
    void updateProduct_ForbiddenForSeller_ShouldReturn403() throws Exception {
        UpdateProductRequest request = new UpdateProductRequest(
                2L, "Назва", "Категорія", "1234567890123", 50.0, "Опис"
        );

        mockMvc.perform(put("/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
