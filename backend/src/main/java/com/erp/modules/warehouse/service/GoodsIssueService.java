package com.erp.modules.warehouse.service;

import com.erp.common.PageResponse;
import com.erp.exception.BusinessException;
import com.erp.exception.ResourceNotFoundException;
import com.erp.modules.product.entity.Product;
import com.erp.modules.product.repository.ProductRepository;
import com.erp.modules.sales.entity.SalesOrder;
import com.erp.modules.sales.repository.SalesOrderRepository;
import com.erp.modules.warehouse.dto.GoodsIssueDto;
import com.erp.modules.warehouse.dto.GoodsIssueItemDto;
import com.erp.modules.warehouse.dto.GoodsIssueItemRequest;
import com.erp.modules.warehouse.dto.GoodsIssueRequest;
import com.erp.modules.warehouse.entity.GoodsIssueItem;
import com.erp.modules.warehouse.entity.GoodsIssueNote;
import com.erp.modules.warehouse.entity.Warehouse;
import com.erp.modules.warehouse.repository.GoodsIssueNoteRepository;
import com.erp.modules.warehouse.repository.WarehouseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class GoodsIssueService {

    private final GoodsIssueNoteRepository ginRepository;
    private final WarehouseRepository warehouseRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    public GoodsIssueService(GoodsIssueNoteRepository ginRepository,
                             WarehouseRepository warehouseRepository,
                             SalesOrderRepository salesOrderRepository,
                             ProductRepository productRepository,
                             InventoryService inventoryService) {
        this.ginRepository = ginRepository;
        this.warehouseRepository = warehouseRepository;
        this.salesOrderRepository = salesOrderRepository;
        this.productRepository = productRepository;
        this.inventoryService = inventoryService;
    }

    @Transactional(readOnly = true)
    public PageResponse<GoodsIssueDto> searchIssues(Long warehouseId, String status, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<GoodsIssueNote> ginPage = ginRepository.searchNotes(
                warehouseId,
                status != null && !status.trim().isEmpty() ? status.trim() : null,
                keyword != null && !keyword.trim().isEmpty() ? keyword.trim() : null,
                pageable
        );

        List<GoodsIssueDto> dtos = new ArrayList<>();
        for (GoodsIssueNote gin : ginPage.getContent()) {
            dtos.add(mapToSummaryDto(gin));
        }

        return new PageResponse<>(
                dtos,
                ginPage.getNumber(),
                ginPage.getSize(),
                ginPage.getTotalElements(),
                ginPage.getTotalPages(),
                ginPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public GoodsIssueDto getById(Long id) {
        GoodsIssueNote gin = ginRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu xuất kho", "id", id));
        return mapToDetailDto(gin);
    }

    @Transactional
    public GoodsIssueDto create(GoodsIssueRequest request, String username) {
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Kho", "id", request.getWarehouseId()));

        SalesOrder so = null;
        if (request.getSoId() != null) {
            so = salesOrderRepository.findById(request.getSoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Đơn bán hàng", "id", request.getSoId()));
        }

        GoodsIssueNote gin = new GoodsIssueNote();
        gin.setGinCode(generateGinCode());
        gin.setWarehouse(warehouse);
        gin.setSalesOrder(so);
        gin.setIssueDate(request.getIssueDate() != null ? request.getIssueDate() : LocalDate.now());
        gin.setIssueType(request.getIssueType() != null ? request.getIssueType() : "SALES_ORDER");
        gin.setStatus("DRAFT");
        gin.setNotes(request.getNotes());
        gin.setCreatedBy(username != null ? username : "SYSTEM");

        for (GoodsIssueItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", "id", itemReq.getProductId()));

            GoodsIssueItem item = new GoodsIssueItem();
            item.setProduct(product);
            item.setRequestedQuantity(itemReq.getRequestedQuantity() != null ? itemReq.getRequestedQuantity() : BigDecimal.ZERO);
            item.setIssuedQuantity(itemReq.getIssuedQuantity());
            item.setNotes(itemReq.getNotes());

            gin.addItem(item);
        }

        GoodsIssueNote saved = ginRepository.save(gin);
        return mapToDetailDto(saved);
    }

    @Transactional
    public GoodsIssueDto confirm(Long id, String username) {
        GoodsIssueNote gin = ginRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu xuất kho", "id", id));

        if (!"DRAFT".equals(gin.getStatus())) {
            throw new BusinessException("Chỉ có thể xác nhận phiếu xuất kho ở trạng thái DRAFT");
        }

        // 1. Trừ tồn kho và ghi Sổ cái kho cho từng sản phẩm
        for (GoodsIssueItem item : gin.getItems()) {
            BigDecimal qtyToDeduct = item.getIssuedQuantity().compareTo(BigDecimal.ZERO) > 0
                    ? item.getIssuedQuantity()
                    : item.getRequestedQuantity();

            item.setIssuedQuantity(qtyToDeduct);

            inventoryService.deductIssuedStock(
                    gin.getWarehouse().getId(),
                    item.getProduct().getId(),
                    qtyToDeduct,
                    "SO_ISSUE",
                    gin.getId(),
                    gin.getGinCode(),
                    item.getNotes(),
                    username
            );
        }

        // 2. Cập nhật phiếu xuất kho sang CONFIRMED
        gin.setStatus("CONFIRMED");
        gin.setConfirmedBy(username != null ? username : "SYSTEM");
        gin.setConfirmedAt(LocalDateTime.now());
        ginRepository.save(gin);

        // 3. Nếu phiếu gắn liền với đơn bán SO:
        // Cập nhật trạng thái SO sang DELIVERING
        SalesOrder so = gin.getSalesOrder();
        if (so != null && "APPROVED".equals(so.getStatus())) {
            so.setStatus("DELIVERING");
            salesOrderRepository.save(so);
        }

        return mapToDetailDto(gin);
    }

    private String generateGinCode() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int rand = ThreadLocalRandom.current().nextInt(1000, 9999);
        String code = "GIN-" + datePart + "-" + rand;
        while (ginRepository.existsByGinCode(code)) {
            rand = ThreadLocalRandom.current().nextInt(1000, 9999);
            code = "GIN-" + datePart + "-" + rand;
        }
        return code;
    }

    public GoodsIssueDto mapToSummaryDto(GoodsIssueNote gin) {
        GoodsIssueDto dto = new GoodsIssueDto();
        dto.setId(gin.getId());
        dto.setGinCode(gin.getGinCode());
        if (gin.getSalesOrder() != null) {
            dto.setSoId(gin.getSalesOrder().getId());
            dto.setSoCode(gin.getSalesOrder().getOrderCode());
        }
        dto.setWarehouseId(gin.getWarehouse().getId());
        dto.setWarehouseCode(gin.getWarehouse().getCode());
        dto.setWarehouseName(gin.getWarehouse().getName());
        dto.setIssueDate(gin.getIssueDate());
        dto.setIssueType(gin.getIssueType());
        dto.setStatus(gin.getStatus());
        dto.setNotes(gin.getNotes());
        dto.setCreatedBy(gin.getCreatedBy());
        dto.setConfirmedBy(gin.getConfirmedBy());
        dto.setConfirmedAt(gin.getConfirmedAt());
        dto.setCreatedAt(gin.getCreatedAt());
        return dto;
    }

    public GoodsIssueDto mapToDetailDto(GoodsIssueNote gin) {
        GoodsIssueDto dto = mapToSummaryDto(gin);

        List<GoodsIssueItemDto> itemDtos = new ArrayList<>();
        if (gin.getItems() != null) {
            for (GoodsIssueItem item : gin.getItems()) {
                GoodsIssueItemDto itemDto = new GoodsIssueItemDto();
                itemDto.setId(item.getId());
                itemDto.setProductId(item.getProduct().getId());
                itemDto.setProductSku(item.getProduct().getSku());
                itemDto.setProductName(item.getProduct().getName());
                itemDto.setProductUnit(item.getProduct().getUnit());
                itemDto.setRequestedQuantity(item.getRequestedQuantity());
                itemDto.setIssuedQuantity(item.getIssuedQuantity());
                itemDto.setNotes(item.getNotes());
                itemDtos.add(itemDto);
            }
        }
        dto.setItems(itemDtos);
        return dto;
    }
}
