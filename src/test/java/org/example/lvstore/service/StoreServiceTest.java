package org.example.lvstore.service;

import org.example.lvstore.entity.Store;
import org.example.lvstore.entity.User;
import org.example.lvstore.payload.store.CreateStoreRequest;
import org.example.lvstore.payload.store.UpdateStoreRequest;
import org.example.lvstore.repository.StoreRepository;
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
public class StoreServiceTest {

    @Mock
    private StoreRepository storeRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private StoreService storeService;

    @Test
    void testCreateStore_Success() {
        CreateStoreRequest request = new CreateStoreRequest("Store A", "Lviv", 1L);
        User mockAdmin = new User();
        mockAdmin.setId(1L);

        Store savedStore = Store.builder()
                .name("Store A")
                .location("Lviv")
                .admin(mockAdmin)
                .build();

        when(userService.getUserById(1L)).thenReturn(mockAdmin);
        when(storeRepository.save(any(Store.class))).thenReturn(savedStore);

        Store result = storeService.createStore(request);

        assertNotNull(result);
        assertEquals("Store A", result.getName());
        assertEquals("Lviv", result.getLocation());
        assertEquals(mockAdmin, result.getAdmin());

        verify(userService, times(1)).getUserById(1L);
        verify(storeRepository, times(1)).save(any(Store.class));
    }

    @Test
    void testGetStoreById_Success() {
        Store store = new Store();
        store.setId(1L);
        when(storeRepository.findById(1L)).thenReturn(Optional.of(store));

        Store result = storeService.getStoreById(1L);
        assertEquals(1L, result.getId());
        verify(storeRepository, times(1)).findById(1L);
    }

    @Test
    void testGetStoreById_NotFound() {
        when(storeRepository.findById(999L)).thenReturn(Optional.empty());

        NoSuchElementException ex = assertThrows(NoSuchElementException.class,
                () -> storeService.getStoreById(999L));
        assertEquals("Store with id 999 not found", ex.getMessage());
        verify(storeRepository, times(1)).findById(999L);
    }

    @Test
    void testGetAllStores() {
        Store s1 = new Store();
        Store s2 = new Store();
        when(storeRepository.findAll()).thenReturn(List.of(s1, s2));

        List<Store> result = storeService.getAllStores();
        assertEquals(2, result.size());
        verify(storeRepository, times(1)).findAll();
    }

    @Test
    void testUpdateStore_Success() {
        User newAdmin = new User();
        newAdmin.setId(2L);

        Store existing = new Store();
        existing.setId(1L);
        existing.setName("Old Name");
        existing.setLocation("Old Location");

        UpdateStoreRequest request = new UpdateStoreRequest(1L, "New Name", "New Location", 2L);

        when(storeRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(userService.getUserById(2L)).thenReturn(newAdmin);
        when(storeRepository.save(existing)).thenReturn(existing);

        Store updated = storeService.updateStore(request);

        assertEquals("New Name", updated.getName());
        assertEquals("New Location", updated.getLocation());
        assertEquals(newAdmin, updated.getAdmin());

        verify(storeRepository, times(1)).save(existing);
    }

    @Test
    void testUpdateStore_StoreNotFound() {
        UpdateStoreRequest request = new UpdateStoreRequest(123L, "X", "Y", 1L);
        when(storeRepository.findById(123L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> storeService.updateStore(request));
        verify(storeRepository, times(1)).findById(123L);
        verify(storeRepository, times(0)).save(any(Store.class));
    }

    @Test
    void testDeleteStore_Success() {
        doNothing().when(storeRepository).deleteById(10L);
        storeService.deleteStore(10L);
        verify(storeRepository, times(1)).deleteById(10L);
    }
}
