package org.example.lvstore.service;

import org.example.lvstore.entity.Product;
import org.example.lvstore.entity.Warehouse;
import org.example.lvstore.entity.WarehouseStock;
import org.example.lvstore.payload.warehousestock.CreateWarehouseStockRequest;
import org.example.lvstore.payload.warehousestock.UpdateWarehouseStockRequest;
import org.example.lvstore.repository.WarehouseStockRepository;
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
public class WarehouseStockServiceTest {

    @Mock
    private WarehouseStockRepository warehouseStockRepository;

    @Mock
    private WarehouseService warehouseService;

    @Mock
    private ProductService productService;

    @InjectMocks
    private WarehouseStockService warehouseStockService;

    @Test
    void testCreateWarehouseStock_Success() {
        CreateWarehouseStockRequest request = new CreateWarehouseStockRequest(1L, 2L, 100);
        Warehouse warehouse = new Warehouse();
        warehouse.setId(1L);
        Product product = new Product();
        product.setId(2L);

        when(warehouseService.getWarehouseById(1L)).thenReturn(warehouse);
        when(productService.getProductById(2L)).thenReturn(product);

        WarehouseStock expected = WarehouseStock.builder()
                .warehouse(warehouse)
                .product(product)
                .quantity(100)
                .build();

        when(warehouseStockRepository.save(any(WarehouseStock.class))).thenReturn(expected);

        WarehouseStock result = warehouseStockService.createWarehouseStock(request);

        assertNotNull(result);
        assertEquals(warehouse, result.getWarehouse());
        assertEquals(product, result.getProduct());
        assertEquals(100, result.getQuantity());

        verify(warehouseStockRepository, times(1)).save(any(WarehouseStock.class));
    }

    @Test
    void testGetWarehouseStockById_Success() {
        WarehouseStock stock = new WarehouseStock();
        stock.setId(1L);

        when(warehouseStockRepository.findById(1L)).thenReturn(Optional.of(stock));

        WarehouseStock result = warehouseStockService.getWarehouseStockById(1L);

        assertEquals(1L, result.getId());
        verify(warehouseStockRepository, times(1)).findById(1L);
    }

    @Test
    void testGetWarehouseStockById_NotFound() {
        when(warehouseStockRepository.findById(99L)).thenReturn(Optional.empty());

        NoSuchElementException ex = assertThrows(NoSuchElementException.class,
                () -> warehouseStockService.getWarehouseStockById(99L));

        assertEquals("WarehouseStock with id 99 not found", ex.getMessage());
        verify(warehouseStockRepository, times(1)).findById(99L);
    }

    @Test
    void testGetAllWarehouseStocks() {
        WarehouseStock ws1 = new WarehouseStock();
        WarehouseStock ws2 = new WarehouseStock();

        when(warehouseStockRepository.findAll()).thenReturn(List.of(ws1, ws2));

        List<WarehouseStock> result = warehouseStockService.getAllWarehouseStocks();

        assertEquals(2, result.size());
        verify(warehouseStockRepository, times(1)).findAll();
    }

    @Test
    void testUpdateWarehouseStock_Success() {
        UpdateWarehouseStockRequest request = new UpdateWarehouseStockRequest(1L, 2L, 3L, 200);

        WarehouseStock existingStock = new WarehouseStock();
        existingStock.setId(1L);
        existingStock.setQuantity(50);

        Warehouse warehouse = new Warehouse();
        warehouse.setId(2L);
        Product product = new Product();
        product.setId(3L);

        when(warehouseStockRepository.findById(1L)).thenReturn(Optional.of(existingStock));
        when(warehouseService.getWarehouseById(2L)).thenReturn(warehouse);
        when(productService.getProductById(3L)).thenReturn(product);
        when(warehouseStockRepository.save(existingStock)).thenReturn(existingStock);

        WarehouseStock result = warehouseStockService.updateWarehouseStock(request);

        assertEquals(200, result.getQuantity());
        assertEquals(product, result.getProduct());
        assertEquals(warehouse, result.getWarehouse());

        verify(warehouseStockRepository, times(1)).findById(1L);
        verify(warehouseStockRepository, times(1)).save(existingStock);
    }

    @Test
    void testUpdateWarehouseStock_NotFound() {
        UpdateWarehouseStockRequest request = new UpdateWarehouseStockRequest(999L, 1L, 1L, 100);

        when(warehouseStockRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> warehouseStockService.updateWarehouseStock(request));
        verify(warehouseStockRepository, times(1)).findById(999L);
        verify(warehouseStockRepository, never()).save(any());
    }

    @Test
    void testGetWarehouseStocksByWarehouseId() {
        WarehouseStock stock1 = new WarehouseStock();
        WarehouseStock stock2 = new WarehouseStock();

        when(warehouseStockRepository.findByWarehouseId(1L)).thenReturn(List.of(stock1, stock2));

        List<WarehouseStock> result = warehouseStockService.getWarehouseStocksByWarehouseId(1L);

        assertEquals(2, result.size());
        verify(warehouseStockRepository, times(1)).findByWarehouseId(1L);
    }

    @Test
    void testGetWarehouseStocksByProductId() {
        WarehouseStock stock1 = new WarehouseStock();

        when(warehouseStockRepository.findByProductId(2L)).thenReturn(List.of(stock1));

        List<WarehouseStock> result = warehouseStockService.getWarehouseStocksByProductId(2L);

        assertEquals(1, result.size());
        verify(warehouseStockRepository, times(1)).findByProductId(2L);
    }

    @Test
    void testDeleteWarehouseStock() {
        doNothing().when(warehouseStockRepository).deleteById(3L);

        warehouseStockService.deleteWarehouseStock(3L);

        verify(warehouseStockRepository, times(1)).deleteById(3L);
    }
}
