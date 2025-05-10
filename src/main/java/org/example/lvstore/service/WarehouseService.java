package org.example.lvstore.service;

import lombok.RequiredArgsConstructor;
import org.example.lvstore.entity.User;
import org.example.lvstore.entity.Warehouse;
import org.example.lvstore.payload.warehouse.CreateWarehouseRequest;
import org.example.lvstore.payload.warehouse.UpdateWarehouseRequest;
import org.example.lvstore.repository.WarehouseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final UserService userService;

    public Warehouse getWarehouseById(Long id) {
        return warehouseRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(String.format("Warehouse with id %s not found", id)));
    }

    public Warehouse createWarehouse(CreateWarehouseRequest request) {
        User manager = userService.getUserById(request.managerId());

        Warehouse warehouse = Warehouse.builder()
                .name(request.name())
                .location(request.location())
                .manager(manager)
                .build();

        return warehouseRepository.save(warehouse);
    }

    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findAll();
    }

    public Warehouse updateWarehouse(UpdateWarehouseRequest request) {
        Warehouse warehouse = getWarehouseById(request.id());
        User manager = userService.getUserById(request.managerId());

        warehouse.setName(request.name());
        warehouse.setLocation(request.location());
        warehouse.setManager(manager);

        return warehouseRepository.save(warehouse);
    }

    public void deleteWarehouse(Long id) {
        warehouseRepository.deleteById(id);
    }
}
