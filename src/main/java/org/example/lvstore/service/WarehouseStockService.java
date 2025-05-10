package org.example.lvstore.service;

import lombok.RequiredArgsConstructor;
import org.example.lvstore.entity.Product;
import org.example.lvstore.entity.Warehouse;
import org.example.lvstore.entity.WarehouseStock;
import org.example.lvstore.payload.warehousestock.CreateWarehouseStockRequest;
import org.example.lvstore.payload.warehousestock.UpdateWarehouseStockRequest;
import org.example.lvstore.repository.WarehouseStockRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class WarehouseStockService {

    private final WarehouseStockRepository warehouseStockRepository;
    private final WarehouseService warehouseService;
    private final ProductService productService;

    public WarehouseStock getWarehouseStockById(Long id) {
        return warehouseStockRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(
                        String.format("WarehouseStock with id %s not found", id)));
    }

    public WarehouseStock createWarehouseStock(CreateWarehouseStockRequest request) {
        Warehouse warehouse = warehouseService.getWarehouseById(request.warehouseId());
        Product product = productService.getProductById(request.productId());

        WarehouseStock warehouseStock = WarehouseStock.builder()
                .warehouse(warehouse)
                .product(product)
                .quantity(request.quantity())
                .build();

        return warehouseStockRepository.save(warehouseStock);
    }

    public List<WarehouseStock> getAllWarehouseStocks() {
        return warehouseStockRepository.findAll();
    }

    public WarehouseStock updateWarehouseStock(UpdateWarehouseStockRequest request) {
        WarehouseStock stock = getWarehouseStockById(request.id());

        Warehouse warehouse = warehouseService.getWarehouseById(request.warehouseId());
        Product product = productService.getProductById(request.productId());

        stock.setWarehouse(warehouse);
        stock.setProduct(product);
        stock.setQuantity(request.quantity());

        return warehouseStockRepository.save(stock);
    }

    public List<WarehouseStock> getWarehouseStocksByWarehouseId(Long warehouseId) {
        return warehouseStockRepository.findByWarehouseId(warehouseId);
    }

    public List<WarehouseStock> getWarehouseStocksByProductId(Long productId) {
        return warehouseStockRepository.findByProductId(productId);
    }

    public void deleteWarehouseStock(Long id) {
        warehouseStockRepository.deleteById(id);
    }
}
