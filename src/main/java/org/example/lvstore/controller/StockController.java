package org.example.lvstore.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.example.lvstore.entity.Stock;
import org.example.lvstore.payload.stock.CreateStockRequest;
import org.example.lvstore.payload.stock.UpdateStockRequest;
import org.example.lvstore.service.StockService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/stocks")
@SecurityRequirement(name = "bearerAuth")
public class StockController {

    private final StockService stockService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Stock> createStock(@RequestBody CreateStockRequest request) {
        return ResponseEntity.ok(stockService.createStock(request));
    }

    @GetMapping
    public ResponseEntity<List<Stock>> getAllStocks() {
        return ResponseEntity.ok(stockService.getAllStocks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Stock> getStockById(@PathVariable Long id) {
        return ResponseEntity.ok(stockService.getStockById(id));
    }

    @PutMapping
    public ResponseEntity<Stock> updateStock(@RequestBody UpdateStockRequest request) {
        try {
            return ResponseEntity.ok(stockService.updateStock(request));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteStock(@PathVariable Long id) {
        stockService.deleteStock(id);
    }

    @GetMapping(params = "storeId")
    public ResponseEntity<List<Stock>> getStocksByStore(@RequestParam Long storeId) {
        return ResponseEntity.ok(stockService.getStocksByStoreId(storeId));
    }

    @GetMapping(params = "productId")
    public ResponseEntity<List<Stock>> getStocksByProduct(@RequestParam Long productId) {
        return ResponseEntity.ok(stockService.getStocksByProductId(productId));
    }

    @GetMapping("/critical")
    public ResponseEntity<List<Stock>> getCriticalStocks(@RequestParam Long storeId) {
        return ResponseEntity.ok(stockService.getCriticalStocksByStoreId(storeId));
    }

}
