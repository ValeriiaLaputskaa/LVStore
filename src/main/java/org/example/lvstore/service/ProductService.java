package org.example.lvstore.service;

import lombok.RequiredArgsConstructor;
import org.example.lvstore.entity.Product;
import org.example.lvstore.payload.product.CreateProductRequest;
import org.example.lvstore.payload.product.UpdateProductRequest;
import org.example.lvstore.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(String.format("Product with id %s not found", id)));
    }

    public Product createProduct(CreateProductRequest request) {
        if (productRepository.existsByBarcode(request.barcode())) {
            throw new IllegalArgumentException(String.format("Product with barcode %s already exists", request.barcode()));
        }

        Product product = Product.builder()
                .name(request.name())
                .category(request.category())
                .barcode(request.barcode())
                .price(request.price())
                .description(request.description())
                .build();

        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductByBarcode(String barcode) {
        return productRepository.findByBarcode(barcode)
                .orElseThrow(() -> new NoSuchElementException(String.format("Product with barcode '%s' not found", barcode)));
    }

    public Product updateProduct(UpdateProductRequest request) {
        Product product = getProductById(request.id());

        if (!product.getBarcode().equals(request.barcode()) &&
                productRepository.existsByBarcode(request.barcode())) {
            throw new IllegalArgumentException(String.format("Product with barcode %s already exists", request.barcode()));
        }

        product.setName(request.name());
        product.setCategory(request.category());
        product.setBarcode(request.barcode());
        product.setPrice(request.price());
        product.setDescription(request.description());

        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
