package org.example.lvstore.service;

import org.example.lvstore.entity.User;
import org.example.lvstore.entity.Warehouse;
import org.example.lvstore.payload.warehouse.CreateWarehouseRequest;
import org.example.lvstore.payload.warehouse.UpdateWarehouseRequest;
import org.example.lvstore.repository.WarehouseRepository;
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
public class WarehouseServiceTest {
    @Mock
    private WarehouseRepository warehouseRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private WarehouseService warehouseService;

    @Test
    void testCreateWarehouse_Success() {
        CreateWarehouseRequest request = new CreateWarehouseRequest("Main Warehouse", "Kyiv", 1L);
        User manager = new User();
        manager.setId(1L);

        Warehouse expected = Warehouse.builder()
                .name("Main Warehouse")
                .location("Kyiv")
                .manager(manager)
                .build();

        when(userService.getUserById(1L)).thenReturn(manager);
        when(warehouseRepository.save(any(Warehouse.class))).thenReturn(expected);

        Warehouse result = warehouseService.createWarehouse(request);

        assertNotNull(result);
        assertEquals("Main Warehouse", result.getName());
        assertEquals("Kyiv", result.getLocation());
        assertEquals(manager, result.getManager());
        verify(warehouseRepository, times(1)).save(any(Warehouse.class));
    }

    @Test
    void testGetWarehouseById_Success() {
        Warehouse warehouse = new Warehouse();
        warehouse.setId(1L);
        warehouse.setName("Storage A");

        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(warehouse));

        Warehouse result = warehouseService.getWarehouseById(1L);
        assertEquals("Storage A", result.getName());
        assertEquals(1L, result.getId());
        verify(warehouseRepository, times(1)).findById(1L);
    }

    @Test
    void testGetWarehouseById_NotFound() {
        when(warehouseRepository.findById(999L)).thenReturn(Optional.empty());

        NoSuchElementException exception = assertThrows(NoSuchElementException.class,
                () -> warehouseService.getWarehouseById(999L));

        assertEquals("Warehouse with id 999 not found", exception.getMessage());
        verify(warehouseRepository, times(1)).findById(999L);
    }

    @Test
    void testGetAllWarehouses() {
        Warehouse w1 = new Warehouse();
        Warehouse w2 = new Warehouse();
        when(warehouseRepository.findAll()).thenReturn(List.of(w1, w2));

        List<Warehouse> result = warehouseService.getAllWarehouses();
        assertEquals(2, result.size());
        verify(warehouseRepository, times(1)).findAll();
    }

    @Test
    void testUpdateWarehouse_Success() {
        UpdateWarehouseRequest request = new UpdateWarehouseRequest(1L, "Updated", "Lviv", 10L);
        Warehouse existing = new Warehouse();
        existing.setId(1L);
        existing.setName("Old");
        existing.setLocation("Dnipro");

        User newManager = new User();
        newManager.setId(10L);

        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(userService.getUserById(10L)).thenReturn(newManager);
        when(warehouseRepository.save(existing)).thenReturn(existing);

        Warehouse result = warehouseService.updateWarehouse(request);

        assertEquals("Updated", result.getName());
        assertEquals("Lviv", result.getLocation());
        assertEquals(newManager, result.getManager());

        verify(warehouseRepository, times(1)).findById(1L);
        verify(warehouseRepository, times(1)).save(existing);
    }

    @Test
    void testUpdateWarehouse_NotFound() {
        UpdateWarehouseRequest request = new UpdateWarehouseRequest(123L, "X", "Y", 1L);
        when(warehouseRepository.findById(123L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> warehouseService.updateWarehouse(request));
        verify(warehouseRepository, times(1)).findById(123L);
        verify(warehouseRepository, never()).save(any());
    }

    @Test
    void testDeleteWarehouse() {
        doNothing().when(warehouseRepository).deleteById(5L);
        warehouseService.deleteWarehouse(5L);
        verify(warehouseRepository, times(1)).deleteById(5L);
    }
}
