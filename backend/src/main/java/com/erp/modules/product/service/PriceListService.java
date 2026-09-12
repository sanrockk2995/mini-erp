package com.erp.modules.product.service;

import com.erp.exception.AppException;
import com.erp.exception.ResourceNotFoundException;
import com.erp.modules.product.dto.PriceListDto;
import com.erp.modules.product.dto.PriceListRequest;
import com.erp.modules.product.entity.PriceList;
import com.erp.modules.product.entity.PriceListItem;
import com.erp.modules.product.entity.Product;
import com.erp.modules.product.repository.PriceListItemRepository;
import com.erp.modules.product.repository.PriceListRepository;
import com.erp.modules.product.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class PriceListService {

    private final PriceListRepository priceListRepository;
    private final PriceListItemRepository priceListItemRepository;
    private final ProductRepository productRepository;

    public PriceListService(PriceListRepository priceListRepository,
                            PriceListItemRepository priceListItemRepository,
                            ProductRepository productRepository) {
        this.priceListRepository = priceListRepository;
        this.priceListItemRepository = priceListItemRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<PriceListDto> getAll() {
        List<PriceList> list = priceListRepository.findAll();
        List<PriceListDto> dtos = new ArrayList<>();
        for (PriceList pl : list) {
            dtos.add(mapToDto(pl));
        }
        return dtos;
    }

    @Transactional(readOnly = true)
    public PriceListDto getById(Long id) {
        PriceList priceList = priceListRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bảng giá", "id", id));
        return mapToDto(priceList);
    }

    @Transactional
    public PriceListDto create(PriceListRequest request) {
        if (priceListRepository.existsByCode(request.getCode())) {
            throw new AppException(400, "Mã bảng giá đã tồn tại: " + request.getCode());
        }

        PriceList priceList = new PriceList();
        priceList.setCode(request.getCode());
        priceList.setName(request.getName());
        priceList.setCustomerGroupId(request.getCustomerGroupId());
        priceList.setStartDate(request.getStartDate());
        priceList.setEndDate(request.getEndDate());
        priceList.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        PriceList saved = priceListRepository.save(priceList);

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            List<PriceListItem> items = new ArrayList<>();
            for (PriceListRequest.PriceListItemRequest itemReq : request.getItems()) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", "id", itemReq.getProductId()));
                items.add(new PriceListItem(saved, product, itemReq.getUnitPrice()));
            }
            priceListItemRepository.saveAll(items);
            saved.setItems(items);
        }

        return mapToDto(saved);
    }

    @Transactional
    public PriceListDto update(Long id, PriceListRequest request) {
        PriceList priceList = priceListRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bảng giá", "id", id));

        if (!priceList.getCode().equals(request.getCode()) && priceListRepository.existsByCode(request.getCode())) {
            throw new AppException(400, "Mã bảng giá đã tồn tại: " + request.getCode());
        }

        priceList.setCode(request.getCode());
        priceList.setName(request.getName());
        priceList.setCustomerGroupId(request.getCustomerGroupId());
        priceList.setStartDate(request.getStartDate());
        priceList.setEndDate(request.getEndDate());
        if (request.getIsActive() != null) priceList.setIsActive(request.getIsActive());

        priceList.getItems().clear();
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (PriceListRequest.PriceListItemRequest itemReq : request.getItems()) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", "id", itemReq.getProductId()));
                priceList.getItems().add(new PriceListItem(priceList, product, itemReq.getUnitPrice()));
            }
        }

        PriceList saved = priceListRepository.save(priceList);
        return mapToDto(saved);
    }

    @Transactional
    public void delete(Long id) {
        PriceList priceList = priceListRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bảng giá", "id", id));
        priceListRepository.delete(priceList);
    }

    @Transactional(readOnly = true)
    public BigDecimal getEffectiveProductPrice(Long productId, Long customerGroupId, LocalDate orderDate) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", "id", productId));

        if (customerGroupId != null) {
            List<PriceList> activePriceLists = priceListRepository.findByCustomerGroupIdAndIsActiveTrue(customerGroupId);
            for (PriceList pl : activePriceLists) {
                boolean startsBefore = !orderDate.isBefore(pl.getStartDate());
                boolean endsAfter = pl.getEndDate() == null || !orderDate.isAfter(pl.getEndDate());
                if (startsBefore && endsAfter) {
                    var itemOpt = priceListItemRepository.findByPriceListIdAndProductId(pl.getId(), productId);
                    if (itemOpt.isPresent()) {
                        return itemOpt.get().getUnitPrice();
                    }
                }
            }
        }

        return product.getStandardPrice();
    }

    private PriceListDto mapToDto(PriceList pl) {
        PriceListDto dto = new PriceListDto();
        dto.setId(pl.getId());
        dto.setCode(pl.getCode());
        dto.setName(pl.getName());
        dto.setCustomerGroupId(pl.getCustomerGroupId());
        dto.setStartDate(pl.getStartDate());
        dto.setEndDate(pl.getEndDate());
        dto.setIsActive(pl.getIsActive());

        List<PriceListDto.PriceListItemDto> itemDtos = new ArrayList<>();
        if (pl.getItems() != null) {
            for (PriceListItem item : pl.getItems()) {
                itemDtos.add(new PriceListDto.PriceListItemDto(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProduct().getSku(),
                        item.getProduct().getName(),
                        item.getUnitPrice()
                ));
            }
        }
        dto.setItems(itemDtos);
        return dto;
    }
}
