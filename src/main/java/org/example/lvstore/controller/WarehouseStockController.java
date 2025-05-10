package org.example.lvstore.controller;

import lombok.RequiredArgsConstructor;
import org.example.lvstore.entity.WarehouseStock;
import org.example.lvstore.payload.warehousestock.CreateWarehouseStockRequest;
import org.example.lvstore.payload.warehousestock.UpdateWarehouseStockRequest;
import org.example.lvstore.service.WarehouseStockService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/warehouse-stocks")
@RequiredArgsConstructor
public class WarehouseStockController {

    private final WarehouseStockService warehouseStockService;

    @GetMapping
    public List<WarehouseStock> getAllWarehouseStocks() {
        return warehouseStockService.getAllWarehouseStocks();
    }

    @GetMapping("/{id}")
    public WarehouseStock getWarehouseStockById(@PathVariable Long id) {
        return warehouseStockService.getWarehouseStockById(id);
    }

    @PostMapping
    public WarehouseStock createWarehouseStock(@RequestBody CreateWarehouseStockRequest request) {
        return warehouseStockService.createWarehouseStock(request);
    }

    @PutMapping
    public WarehouseStock updateWarehouseStock(@RequestBody UpdateWarehouseStockRequest request) {
        return warehouseStockService.updateWarehouseStock(request);
    }

    @DeleteMapping("/{id}")
    public void deleteWarehouseStock(@PathVariable Long id) {
        warehouseStockService.deleteWarehouseStock(id);
    }

    @GetMapping(params = "warehouseId")
    public List<WarehouseStock> getStocksByWarehouse(@RequestParam Long warehouseId) {
        return warehouseStockService.getWarehouseStocksByWarehouseId(warehouseId);
    }

    @GetMapping(params = "productId")
    public List<WarehouseStock> getStocksByProduct(@RequestParam Long productId) {
        return warehouseStockService.getWarehouseStocksByProductId(productId);
    }
}
