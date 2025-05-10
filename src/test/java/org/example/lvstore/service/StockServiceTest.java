package org.example.lvstore.service;

import org.example.lvstore.entity.Product;
import org.example.lvstore.entity.Stock;
import org.example.lvstore.entity.Store;
import org.example.lvstore.payload.stock.CreateStockRequest;
import org.example.lvstore.payload.stock.UpdateStockRequest;
import org.example.lvstore.repository.StockRepository;
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
public class StockServiceTest {

    @Mock
    private StockRepository stockRepository;

    @Mock
    private ProductService productService;

    @Mock
    private StoreService storeService;

    @InjectMocks
    private StockService stockService;

    @Test
    void testCreateStock_Success() {
        CreateStockRequest request = new CreateStockRequest(1L, 2L, 100);
        Product product = new Product();
        product.setId(1L);
        Store store = new Store();
        store.setId(2L);

        Stock savedStock = Stock.builder()
                .product(product)
                .store(store)
                .quantity(100)
                .build();

        when(productService.getProductById(1L)).thenReturn(product);
        when(storeService.getStoreById(2L)).thenReturn(store);
        when(stockRepository.save(any(Stock.class))).thenReturn(savedStock);

        Stock result = stockService.createStock(request);

        assertNotNull(result);
        assertEquals(product, result.getProduct());
        assertEquals(store, result.getStore());
        assertEquals(100, result.getQuantity());
        verify(stockRepository, times(1)).save(any(Stock.class));
    }

    @Test
    void testGetStockById_Success() {
        Stock stock = new Stock();
        stock.setId(1L);
        when(stockRepository.findById(1L)).thenReturn(Optional.of(stock));

        Stock result = stockService.getStockById(1L);
        assertEquals(1L, result.getId());
        verify(stockRepository, times(1)).findById(1L);
    }

    @Test
    void testGetStockById_NotFound() {
        when(stockRepository.findById(999L)).thenReturn(Optional.empty());

        NoSuchElementException exception = assertThrows(NoSuchElementException.class,
                () -> stockService.getStockById(999L));
        assertEquals("Stock with id 999 not found", exception.getMessage());
        verify(stockRepository, times(1)).findById(999L);
    }

    @Test
    void testGetAllStocks() {
        Stock s1 = new Stock();
        Stock s2 = new Stock();
        when(stockRepository.findAll()).thenReturn(List.of(s1, s2));

        List<Stock> result = stockService.getAllStocks();
        assertEquals(2, result.size());
        verify(stockRepository, times(1)).findAll();
    }

    @Test
    void testUpdateStock_Success() {
        Product newProduct = new Product();
        newProduct.setId(10L);
        Store newStore = new Store();
        newStore.setId(20L);

        Stock existing = new Stock();
        existing.setId(1L);
        existing.setQuantity(50);

        UpdateStockRequest request = new UpdateStockRequest(1L, 10L, 20L, 200);

        when(stockRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(productService.getProductById(10L)).thenReturn(newProduct);
        when(storeService.getStoreById(20L)).thenReturn(newStore);
        when(stockRepository.save(existing)).thenReturn(existing);

        Stock updated = stockService.updateStock(request);

        assertEquals(newProduct, updated.getProduct());
        assertEquals(newStore, updated.getStore());
        assertEquals(200, updated.getQuantity());
        verify(stockRepository, times(1)).findById(1L);
        verify(stockRepository, times(1)).save(existing);
    }

    @Test
    void testUpdateStock_NotFound() {
        UpdateStockRequest request = new UpdateStockRequest(123L, 1L, 1L, 10);
        when(stockRepository.findById(123L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> stockService.updateStock(request));
        verify(stockRepository, times(1)).findById(123L);
        verify(stockRepository, never()).save(any());
    }

    @Test
    void testDeleteStock() {
        doNothing().when(stockRepository).deleteById(5L);
        stockService.deleteStock(5L);
        verify(stockRepository, times(1)).deleteById(5L);
    }

    @Test
    void testGetStocksByStoreId() {
        Stock s1 = new Stock();
        Stock s2 = new Stock();
        when(stockRepository.findByStoreId(1L)).thenReturn(List.of(s1, s2));

        List<Stock> result = stockService.getStocksByStoreId(1L);
        assertEquals(2, result.size());
        verify(stockRepository, times(1)).findByStoreId(1L);
    }

    @Test
    void testGetStocksByProductId() {
        Stock s1 = new Stock();
        when(stockRepository.findByProductId(99L)).thenReturn(List.of(s1));

        List<Stock> result = stockService.getStocksByProductId(99L);
        assertEquals(1, result.size());
        verify(stockRepository, times(1)).findByProductId(99L);
    }

}
