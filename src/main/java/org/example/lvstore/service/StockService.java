package org.example.lvstore.service;

import lombok.RequiredArgsConstructor;
import org.example.lvstore.entity.Product;
import org.example.lvstore.entity.Stock;
import org.example.lvstore.entity.Store;
import org.example.lvstore.payload.stock.CreateStockRequest;
import org.example.lvstore.payload.stock.UpdateStockRequest;
import org.example.lvstore.repository.StockRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class StockService {

    private final StockRepository stockRepository;
    private final ProductService productService;
    private final StoreService storeService;

    public Stock getStockById(Long id) {
        return stockRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(String.format("Stock with id %s not found", id)));
    }

    public Stock createStock(CreateStockRequest request) {
        Product product = productService.getProductById(request.productId());
        Store store = storeService.getStoreById(request.storeId());

        Stock stock = Stock.builder()
                .product(product)
                .store(store)
                .quantity(request.quantity())
                .minQuantity(request.minQuantity())
                .build();

        return stockRepository.save(stock);
    }

    public List<Stock> getAllStocks() {
        return stockRepository.findAll();
    }

    public Stock updateStock(UpdateStockRequest request) {
        Stock stock = getStockById(request.id());

        Product product = productService.getProductById(request.productId());
        Store store = storeService.getStoreById(request.storeId());

        stock.setProduct(product);
        stock.setStore(store);
        stock.setQuantity(request.quantity());
        stock.setMinQuantity(request.minQuantity());

        return stockRepository.save(stock);
    }

    public void deleteStock(Long id) {
        stockRepository.deleteById(id);
    }

    public List<Stock> getStocksByStoreId(Long storeId) {
        return stockRepository.findByStoreId(storeId);
    }

    public List<Stock> getStocksByProductId(Long productId) {
        return stockRepository.findByProductId(productId);
    }

    public List<Stock> getCriticalStocksByStoreId(Long storeId) {
        return stockRepository.findByStoreId(storeId).stream()
                .filter(stock -> stock.getQuantity() <= stock.getMinQuantity())
                .toList();
    }

    public boolean isInStock(Long productId, Long storeId, Integer quantity) {
        Stock stock = getStockByProductIdAndStoreId(productId, storeId);
        return stock.getQuantity() >= quantity;
    }

    private Stock getStockByProductIdAndStoreId(Long productId, Long storeId) {
        return stockRepository.findByProductIdAndStoreId(productId, storeId)
                .orElseThrow(() -> new NoSuchElementException(String.format("Stock with productId %s and storeId %s not found", productId, storeId)));
    }

    public void decreaseStock(Long productId, Long storeId, Integer quantity) {
        Stock stock = getStockByProductIdAndStoreId(productId, storeId);
        stock.setQuantity(stock.getQuantity() - quantity);
        stockRepository.save(stock);
    }

    public void increaseStock(Long productId, Long storeId, Integer quantity) {
        Stock stock = getStockByProductIdAndStoreId(productId, storeId);
        stock.setQuantity(stock.getQuantity() + quantity);
        stockRepository.save(stock);
    }

}
