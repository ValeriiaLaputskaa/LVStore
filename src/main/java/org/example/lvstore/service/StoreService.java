package org.example.lvstore.service;

import lombok.RequiredArgsConstructor;
import org.example.lvstore.entity.Store;
import org.example.lvstore.entity.User;
import org.example.lvstore.payload.store.CreateStoreRequest;
import org.example.lvstore.payload.store.UpdateStoreRequest;
import org.example.lvstore.repository.StoreRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final StoreRepository storeRepository;
    private final UserService userService;

    public Store getStoreById(Long id) {
        return storeRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(String.format("Store with id %s not found", id)));
    }

    public Store createStore(CreateStoreRequest request) {
        User admin = userService.getUserById(request.adminId());

        Store store = Store.builder()
                .name(request.name())
                .location(request.location())
                .admin(admin)
                .build();

        return storeRepository.save(store);
    }

    public List<Store> getAllStores() {
        return storeRepository.findAll();
    }

    public Store updateStore(UpdateStoreRequest request) {
        Store store = getStoreById(request.id());

        User admin = userService.getUserById(request.adminId());

        store.setName(request.name());
        store.setLocation(request.location());
        store.setAdmin(admin);

        return storeRepository.save(store);
    }

    public void deleteStore(Long id) {
        storeRepository.deleteById(id);
    }
}