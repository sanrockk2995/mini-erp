package com.erp.modules.product.service;

import com.erp.common.PageResponse;
import com.erp.exception.AppException;
import com.erp.exception.ResourceNotFoundException;
import com.erp.modules.product.dto.ProductDto;
import com.erp.modules.product.dto.ProductRequest;
import com.erp.modules.product.entity.Category;
import com.erp.modules.product.entity.Product;
import com.erp.modules.product.entity.ProductAttribute;
import com.erp.modules.product.repository.CategoryRepository;
import com.erp.modules.product.repository.ProductAttributeRepository;
import com.erp.modules.product.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductAttributeRepository attributeRepository;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          ProductAttributeRepository attributeRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.attributeRepository = attributeRepository;
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
        product.setDescription(request.getDescription());
        product.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Danh mục", "id", request.getCategoryId()));
            product.setCategory(category);
        }

        Product saved = productRepository.save(product);

        if (request.getAttributes() != null && !request.getAttributes().isEmpty()) {
            List<ProductAttribute> attributes = new ArrayList<>();
            for (Map.Entry<String, String> entry : request.getAttributes().entrySet()) {
                if (entry.getValue() != null && !entry.getValue().trim().isEmpty()) {
                    attributes.add(new ProductAttribute(saved, entry.getKey(), entry.getValue()));
                }
            }
            attributeRepository.saveAll(attributes);
            saved.setAttributes(attributes);
        }

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
        product.setDescription(request.getDescription());
        if (request.getIsActive() != null) product.setIsActive(request.getIsActive());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Danh mục", "id", request.getCategoryId()));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        // Cập nhật attributes
        attributeRepository.deleteByProductId(id);
        if (request.getAttributes() != null && !request.getAttributes().isEmpty()) {
            List<ProductAttribute> attributes = new ArrayList<>();
            for (Map.Entry<String, String> entry : request.getAttributes().entrySet()) {
                if (entry.getValue() != null && !entry.getValue().trim().isEmpty()) {
                    attributes.add(new ProductAttribute(product, entry.getKey(), entry.getValue()));
                }
            }
            attributeRepository.saveAll(attributes);
            product.setAttributes(attributes);
        } else {
            product.setAttributes(new ArrayList<>());
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
        }
        dto.setUnit(p.getUnit());
        dto.setStandardCost(p.getStandardCost());
        dto.setStandardPrice(p.getStandardPrice());
        dto.setDescription(p.getDescription());
        dto.setIsActive(p.getIsActive());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());

        Map<String, String> attrs = new HashMap<>();
        if (p.getAttributes() != null) {
            for (ProductAttribute attr : p.getAttributes()) {
                attrs.put(attr.getAttrKey(), attr.getAttrValue());
            }
        }
        dto.setAttributes(attrs);

        return dto;
    }
}
