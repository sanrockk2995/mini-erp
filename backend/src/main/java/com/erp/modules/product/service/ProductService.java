package com.erp.modules.product.service;

import com.erp.common.PageResponse;
import com.erp.exception.AppException;
import com.erp.exception.ResourceNotFoundException;
import com.erp.modules.product.dto.ProductDto;
import com.erp.modules.product.dto.ProductRequest;
import com.erp.modules.product.entity.Category;
import com.erp.modules.product.entity.Product;
import com.erp.modules.product.repository.CategoryRepository;
import com.erp.modules.product.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductDto> search(String keyword, Long categoryId, Boolean isActive, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<Product> productPage = productRepository.searchProducts(
                keyword != null && !keyword.trim().isEmpty() ? keyword.trim() : null,
                categoryId,
                isActive,
                pageable
        );

        List<ProductDto> dtos = new ArrayList<>();
        for (Product product : productPage.getContent()) {
            dtos.add(mapToDto(product));
        }

        return new PageResponse<>(
                dtos,
                productPage.getNumber(),
                productPage.getSize(),
                productPage.getTotalElements(),
                productPage.getTotalPages(),
                productPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public List<ProductDto> getAllActive() {
        List<Product> products = productRepository.findByIsActiveTrue();
        List<ProductDto> dtos = new ArrayList<>();
        for (Product p : products) {
            dtos.add(mapToDto(p));
        }
        return dtos;
    }

    @Transactional(readOnly = true)
    public ProductDto getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", "id", id));
        return mapToDto(product);
    }

    @Transactional
    public ProductDto create(ProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new AppException(400, "Mã SKU đã tồn tại: " + request.getSku());
        }
        if (request.getBarcode() != null && !request.getBarcode().trim().isEmpty()
                && productRepository.existsByBarcode(request.getBarcode())) {
            throw new AppException(400, "Mã Barcode đã tồn tại: " + request.getBarcode());
        }

        Product product = new Product();
        product.setSku(request.getSku());
        product.setBarcode(request.getBarcode());
        product.setName(request.getName());
        product.setUnit(request.getUnit() != null ? request.getUnit() : "Cái");
        product.setStandardCost(request.getStandardCost());
        product.setStandardPrice(request.getStandardPrice());
        product.setWholesalePrice(request.getWholesalePrice() != null ? request.getWholesalePrice() : BigDecimal.ZERO);
        product.setColor(request.getColor());
        product.setSize(request.getSize());
        product.setMaterial(request.getMaterial());
        product.setDescription(request.getDescription());
        product.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Danh mục", "id", request.getCategoryId()));
            product.setCategory(category);
            product.setCategoryName(category.getName());
        }

        Product saved = productRepository.save(product);
        return mapToDto(saved);
    }

    @Transactional
    public ProductDto update(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", "id", id));

        if (!product.getSku().equals(request.getSku()) && productRepository.existsBySku(request.getSku())) {
            throw new AppException(400, "Mã SKU đã tồn tại: " + request.getSku());
        }

        product.setSku(request.getSku());
        product.setBarcode(request.getBarcode());
        product.setName(request.getName());
        product.setUnit(request.getUnit() != null ? request.getUnit() : "Cái");
        product.setStandardCost(request.getStandardCost());
        product.setStandardPrice(request.getStandardPrice());
        if (request.getWholesalePrice() != null) product.setWholesalePrice(request.getWholesalePrice());
        product.setColor(request.getColor());
        product.setSize(request.getSize());
        product.setMaterial(request.getMaterial());
        product.setDescription(request.getDescription());
        if (request.getIsActive() != null) product.setIsActive(request.getIsActive());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Danh mục", "id", request.getCategoryId()));
            product.setCategory(category);
            product.setCategoryName(category.getName());
        } else {
            product.setCategory(null);
            product.setCategoryName(null);
        }

        Product saved = productRepository.save(product);
        return mapToDto(saved);
    }

    @Transactional
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", "id", id));
        productRepository.delete(product);
    }

    public ProductDto mapToDto(Product p) {
        ProductDto dto = new ProductDto();
        dto.setId(p.getId());
        dto.setSku(p.getSku());
        dto.setBarcode(p.getBarcode());
        dto.setName(p.getName());
        if (p.getCategory() != null) {
            dto.setCategoryId(p.getCategory().getId());
            dto.setCategoryName(p.getCategory().getName());
        } else if (p.getCategoryName() != null) {
            dto.setCategoryName(p.getCategoryName());
        }
        dto.setUnit(p.getUnit());
        dto.setColor(p.getColor());
        dto.setSize(p.getSize());
        dto.setMaterial(p.getMaterial());
        dto.setStandardCost(p.getStandardCost());
        dto.setStandardPrice(p.getStandardPrice());
        dto.setWholesalePrice(p.getWholesalePrice() != null ? p.getWholesalePrice() : BigDecimal.ZERO);
        dto.setDescription(p.getDescription());
        dto.setIsActive(p.getIsActive());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());

        return dto;
    }
}
