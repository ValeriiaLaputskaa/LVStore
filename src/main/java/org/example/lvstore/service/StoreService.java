package org.example.lvstore.service;

import lombok.RequiredArgsConstructor;
import org.example.lvstore.entity.Store;
import org.example.lvstore.repository.StoreRepository;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class StoreService {
    private final StoreRepository storeRepository;

    public Store getStoreById(Long id) {
        return storeRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(String.format("Store with id %s not found", id)));
    }
}
