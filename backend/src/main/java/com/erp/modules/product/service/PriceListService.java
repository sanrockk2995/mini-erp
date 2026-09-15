package com.erp.modules.product.service;

import com.erp.exception.ResourceNotFoundException;
import com.erp.modules.product.dto.PriceListDto;
import com.erp.modules.product.dto.PriceListRequest;
import com.erp.modules.product.entity.Product;
import com.erp.modules.product.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class PriceListService {

    private final ProductRepository productRepository;

    public PriceListService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<PriceListDto> getAll() {
        List<PriceListDto> dtos = new ArrayList<>();
        dtos.add(buildRetailPriceList());
        dtos.add(buildWholesalePriceList());
        return dtos;
    }

    @Transactional(readOnly = true)
    public PriceListDto getById(Long id) {
        if (id != null && id == 2L) {
            return buildWholesalePriceList();
        }
        return buildRetailPriceList();
    }

    @Transactional
    public PriceListDto create(PriceListRequest request) {
        // Virtual creation
        PriceListDto dto = new PriceListDto();
        dto.setId(3L);
        dto.setCode(request.getCode());
        dto.setName(request.getName());
        dto.setCustomerGroupId(request.getCustomerGroupId());
        dto.setStartDate(request.getStartDate());
        dto.setEndDate(request.getEndDate());
        dto.setIsActive(true);
        return dto;
    }

    @Transactional
    public PriceListDto update(Long id, PriceListRequest request) {
        PriceListDto dto = getById(id);
        dto.setCode(request.getCode());
        dto.setName(request.getName());
        return dto;
    }

    @Transactional
    public void delete(Long id) {
        // Virtual delete
    }

    @Transactional(readOnly = true)
    public BigDecimal getEffectiveProductPrice(Long productId, Long customerGroupId, LocalDate orderDate) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", "id", productId));

        if (customerGroupId != null && customerGroupId == 3L) {
            if (product.getWholesalePrice() != null && product.getWholesalePrice().compareTo(BigDecimal.ZERO) > 0) {
                return product.getWholesalePrice();
            }
        }

        return product.getStandardPrice();
    }

    private PriceListDto buildRetailPriceList() {
        PriceListDto dto = new PriceListDto();
        dto.setId(1L);
        dto.setCode("PL-RETAIL");
        dto.setName("Bảng Giá Bán Lẻ Thời Trang Tiêu Chuẩn");
        dto.setCustomerGroupId(1L);
        dto.setCustomerGroupName("Khách Hàng Mua Lẻ");
        dto.setStartDate(LocalDate.of(2025, 1, 1));
        dto.setIsActive(true);

        List<Product> products = productRepository.findByIsActiveTrue();
        List<PriceListDto.PriceListItemDto> items = new ArrayList<>();
        for (Product p : products) {
            items.add(new PriceListDto.PriceListItemDto(
                    p.getId(),
                    p.getId(),
                    p.getSku(),
                    p.getName(),
                    p.getStandardPrice()
            ));
        }
        dto.setItems(items);
        return dto;
    }

    private PriceListDto buildWholesalePriceList() {
        PriceListDto dto = new PriceListDto();
        dto.setId(2L);
        dto.setCode("PL-WHOLESALE");
        dto.setName("Bảng Giá Đại Lý & Phân Phối Sỉ");
        dto.setCustomerGroupId(3L);
        dto.setCustomerGroupName("Khách Hàng Mua Buôn / Đại Lý");
        dto.setStartDate(LocalDate.of(2025, 1, 1));
        dto.setIsActive(true);

        List<Product> products = productRepository.findByIsActiveTrue();
        List<PriceListDto.PriceListItemDto> items = new ArrayList<>();
        for (Product p : products) {
            BigDecimal price = p.getWholesalePrice() != null && p.getWholesalePrice().compareTo(BigDecimal.ZERO) > 0
                    ? p.getWholesalePrice()
                    : p.getStandardPrice().multiply(new BigDecimal("0.70"));
            items.add(new PriceListDto.PriceListItemDto(
                    p.getId(),
                    p.getId(),
                    p.getSku(),
                    p.getName(),
                    price
            ));
        }
        dto.setItems(items);
        return dto;
    }
}
