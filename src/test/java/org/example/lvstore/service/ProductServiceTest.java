package org.example.lvstore.service;

import org.example.lvstore.entity.Product;
import org.example.lvstore.payload.product.CreateProductRequest;
import org.example.lvstore.payload.product.UpdateProductRequest;
import org.example.lvstore.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void testCreateProduct_Success() {
        CreateProductRequest request = new CreateProductRequest("Product1", "Category1", "123456", 100.0, "Description");

        when(productRepository.existsByBarcode("123456")).thenReturn(false);

        Product savedProduct = Product.builder()
                .name("Product1")
                .category("Category1")
                .barcode("123456")
                .price(100.0)
                .description("Description")
                .build();

        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);

        Product result = productService.createProduct(request);

        assertNotNull(result);
        assertEquals("Product1", result.getName());
        assertEquals("Category1", result.getCategory());
        assertEquals("123456", result.getBarcode());
        assertEquals(100.0, result.getPrice());
        assertEquals("Description", result.getDescription());
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    void testCreateProduct_BarcodeExists() {
        CreateProductRequest request = new CreateProductRequest("Product2", "Category2", "123456", 200.0, "Another description");
        when(productRepository.existsByBarcode("123456")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> productService.createProduct(request));
        verify(productRepository, times(1)).existsByBarcode("123456");
        verify(productRepository, times(0)).save(any(Product.class));
    }

    @Test
    void testGetProductById_Success() {
        Product product = new Product();
        product.setId(1L);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        Product result = productService.getProductById(1L);

        assertEquals(1L, result.getId());
        verify(productRepository, times(1)).findById(1L);
    }

    @Test
    void testGetProductById_NotFound() {
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> productService.getProductById(999L));
        verify(productRepository, times(1)).findById(999L);
    }

    @Test
    void testGetProductByBarcode_Success() {
        Product product = new Product();
        product.setBarcode("123456");
        when(productRepository.findByBarcode("123456")).thenReturn(Optional.of(product));

        Product result = productService.getProductByBarcode("123456");

        assertEquals("123456", result.getBarcode());
        verify(productRepository, times(1)).findByBarcode("123456");
    }

    @Test
    void testGetProductByBarcode_NotFound() {
        when(productRepository.findByBarcode("000000")).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> productService.getProductByBarcode("000000"));
        verify(productRepository, times(1)).findByBarcode("000000");
    }

    @Test
    void testUpdateProduct_Success() {
        UpdateProductRequest request = new UpdateProductRequest(1L, "UpdatedProduct", "UpdatedCategory", "123456", 150.0, "Updated description");
        Product existingProduct = new Product();
        existingProduct.setId(1L);
        existingProduct.setBarcode("123456");

        when(productRepository.findById(1L)).thenReturn(Optional.of(existingProduct));
        when(productRepository.save(any(Product.class))).thenReturn(existingProduct);

        Product updatedProduct = productService.updateProduct(request);

        assertEquals("UpdatedProduct", updatedProduct.getName());
        assertEquals("UpdatedCategory", updatedProduct.getCategory());
        assertEquals("123456", updatedProduct.getBarcode());
        assertEquals(150.0, updatedProduct.getPrice());
        assertEquals("Updated description", updatedProduct.getDescription());
        verify(productRepository, times(1)).findById(1L);
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    void testUpdateProduct_NotFound() {
        UpdateProductRequest request = new UpdateProductRequest(404L, "NonExistingProduct", "NonExistingCategory", "999999", 200.0, "NonExisting description");
        when(productRepository.findById(404L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> productService.updateProduct(request));
        verify(productRepository, times(1)).findById(404L);
        verify(productRepository, times(0)).save(any(Product.class));
    }

    @Test
    void testUpdateProduct_BarcodeExists() {
        UpdateProductRequest request = new UpdateProductRequest(1L, "UpdatedProduct", "UpdatedCategory", "123456", 150.0, "Updated description");
        Product existingProduct = new Product();
        existingProduct.setId(1L);
        existingProduct.setBarcode("123455");

        when(productRepository.findById(1L)).thenReturn(Optional.of(existingProduct));
        when(productRepository.existsByBarcode("123456")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> productService.updateProduct(request));
        verify(productRepository, times(1)).existsByBarcode("123456");
        verify(productRepository, times(0)).save(any(Product.class));
    }

    @Test
    void testDeleteProduct_Success() {
        doNothing().when(productRepository).deleteById(10L);

        productService.deleteProduct(10L);

        verify(productRepository, times(1)).deleteById(10L);
    }

    @Test
    void testGetAllProducts_Success() {
        Product p1 = new Product();
        Product p2 = new Product();
        when(productRepository.findAll()).thenReturn(List.of(p1, p2));

        List<Product> products = productService.getAllProducts();

        assertEquals(2, products.size());
        verify(productRepository, times(1)).findAll();
    }

}
