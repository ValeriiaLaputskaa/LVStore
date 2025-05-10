package org.example.lvstore.controller;

import lombok.RequiredArgsConstructor;
import org.example.lvstore.entity.Store;
import org.example.lvstore.payload.store.CreateStoreRequest;
import org.example.lvstore.payload.store.UpdateStoreRequest;
import org.example.lvstore.service.StoreService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/stores")
public class StoreController {

    private final StoreService storeService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Store> createStore(@RequestBody CreateStoreRequest request) {
        return ResponseEntity.ok(storeService.createStore(request));
    }

    @GetMapping
    public ResponseEntity<List<Store>> getAllStores() {
        return ResponseEntity.ok(storeService.getAllStores());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Store> getStoreById(@PathVariable Long id) {
        return ResponseEntity.ok(storeService.getStoreById(id));
    }

    @PutMapping
    public ResponseEntity<Store> updateStore(@RequestBody UpdateStoreRequest request) {
        try {
            return ResponseEntity.ok(storeService.updateStore(request));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteStore(@PathVariable Long id) {
        storeService.deleteStore(id);
    }
}
