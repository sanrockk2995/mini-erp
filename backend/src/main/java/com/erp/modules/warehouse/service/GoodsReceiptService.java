package com.erp.modules.warehouse.service;

import com.erp.common.PageResponse;
import com.erp.exception.BusinessException;
import com.erp.exception.ResourceNotFoundException;
import com.erp.modules.product.entity.Product;
import com.erp.modules.product.repository.ProductRepository;
import com.erp.modules.purchase.entity.PurchaseOrder;
import com.erp.modules.purchase.repository.PurchaseOrderRepository;
import com.erp.modules.purchase.service.SupplierDebtService;
import com.erp.modules.warehouse.dto.GoodsReceiptDto;
import com.erp.modules.warehouse.dto.GoodsReceiptItemDto;
import com.erp.modules.warehouse.dto.GoodsReceiptItemRequest;
import com.erp.modules.warehouse.dto.GoodsReceiptRequest;
import com.erp.modules.warehouse.entity.GoodsReceiptItem;
import com.erp.modules.warehouse.entity.GoodsReceiptNote;
import com.erp.modules.warehouse.entity.Warehouse;
import com.erp.modules.warehouse.repository.GoodsReceiptNoteRepository;
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
public class GoodsReceiptService {

    private final GoodsReceiptNoteRepository grnRepository;
    private final WarehouseRepository warehouseRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final SupplierDebtService supplierDebtService;

    public GoodsReceiptService(GoodsReceiptNoteRepository grnRepository,
                               WarehouseRepository warehouseRepository,
                               PurchaseOrderRepository purchaseOrderRepository,
                               ProductRepository productRepository,
                               InventoryService inventoryService,
                               SupplierDebtService supplierDebtService) {
        this.grnRepository = grnRepository;
        this.warehouseRepository = warehouseRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.productRepository = productRepository;
        this.inventoryService = inventoryService;
        this.supplierDebtService = supplierDebtService;
    }

    @Transactional(readOnly = true)
    public PageResponse<GoodsReceiptDto> searchReceipts(Long warehouseId, String status, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<GoodsReceiptNote> grnPage = grnRepository.searchNotes(
                warehouseId,
                status != null && !status.trim().isEmpty() ? status.trim() : null,
                keyword != null && !keyword.trim().isEmpty() ? keyword.trim() : null,
                pageable
        );

        List<GoodsReceiptDto> dtos = new ArrayList<>();
        for (GoodsReceiptNote grn : grnPage.getContent()) {
            dtos.add(mapToSummaryDto(grn));
        }

        return new PageResponse<>(
                dtos,
                grnPage.getNumber(),
                grnPage.getSize(),
                grnPage.getTotalElements(),
                grnPage.getTotalPages(),
                grnPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public GoodsReceiptDto getById(Long id) {
        GoodsReceiptNote grn = grnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu nhập kho", "id", id));
        return mapToDetailDto(grn);
    }

    @Transactional
    public GoodsReceiptDto create(GoodsReceiptRequest request, String username) {
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Kho", "id", request.getWarehouseId()));

        PurchaseOrder po = null;
        if (request.getPoId() != null) {
            po = purchaseOrderRepository.findById(request.getPoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Đơn mua hàng", "id", request.getPoId()));
        }

        GoodsReceiptNote grn = new GoodsReceiptNote();
        grn.setGrnCode(generateGrnCode());
        grn.setWarehouse(warehouse);
        grn.setPurchaseOrder(po);
        grn.setReceiptDate(request.getReceiptDate() != null ? request.getReceiptDate() : LocalDate.now());
        grn.setStatus("DRAFT");
        grn.setNotes(request.getNotes());
        grn.setCreatedBy(username != null ? username : "SYSTEM");

        for (GoodsReceiptItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", "id", itemReq.getProductId()));

            GoodsReceiptItem item = new GoodsReceiptItem();
            item.setProduct(product);
            item.setOrderedQuantity(itemReq.getOrderedQuantity() != null ? itemReq.getOrderedQuantity() : BigDecimal.ZERO);
            item.setReceivedQuantity(itemReq.getReceivedQuantity());
            item.setUnitPrice(itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : BigDecimal.ZERO);
            item.setNotes(itemReq.getNotes());

            grn.addItem(item);
        }

        GoodsReceiptNote saved = grnRepository.save(grn);
        return mapToDetailDto(saved);
    }

    @Transactional
    public GoodsReceiptDto confirm(Long id, String username) {
        GoodsReceiptNote grn = grnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phiếu nhập kho", "id", id));

        if (!"DRAFT".equals(grn.getStatus())) {
            throw new BusinessException("Chỉ có thể xác nhận phiếu nhập kho ở trạng thái DRAFT");
        }

        BigDecimal totalReceivedValue = BigDecimal.ZERO;

        // 1. Tăng tồn kho và ghi sổ cái kho cho từng mặt hàng
        for (GoodsReceiptItem item : grn.getItems()) {
            inventoryService.addReceivedStock(
                    grn.getWarehouse().getId(),
                    item.getProduct().getId(),
                    item.getReceivedQuantity(),
                    item.getUnitPrice(),
                    "PO_RECEIPT",
                    grn.getId(),
                    grn.getGrnCode(),
                    item.getNotes(),
                    username
            );

            BigDecimal lineVal = item.getReceivedQuantity().multiply(item.getUnitPrice());
            totalReceivedValue = totalReceivedValue.add(lineVal);
        }

        // 2. Cập nhật trạng thái phiếu nhập kho sang CONFIRMED
        grn.setStatus("CONFIRMED");
        grn.setConfirmedBy(username != null ? username : "SYSTEM");
        grn.setConfirmedAt(LocalDateTime.now());
        grnRepository.save(grn);

        // 3. Nếu phiếu gắn liền với PO:
        // Cập nhật PO sang RECEIVED và tự động phát sinh công nợ nhà cung cấp
        PurchaseOrder po = grn.getPurchaseOrder();
        if (po != null) {
            po.setStatus("RECEIVED");
            purchaseOrderRepository.save(po);

            BigDecimal debtAmount = totalReceivedValue.compareTo(BigDecimal.ZERO) > 0 ? totalReceivedValue : po.getTotalAmount();
            supplierDebtService.createDebtFromPurchaseOrder(po, debtAmount);
        }

        return mapToDetailDto(grn);
    }

    private String generateGrnCode() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int rand = ThreadLocalRandom.current().nextInt(1000, 9999);
        String code = "GRN-" + datePart + "-" + rand;
        while (grnRepository.existsByGrnCode(code)) {
            rand = ThreadLocalRandom.current().nextInt(1000, 9999);
            code = "GRN-" + datePart + "-" + rand;
        }
        return code;
    }

    public GoodsReceiptDto mapToSummaryDto(GoodsReceiptNote grn) {
        GoodsReceiptDto dto = new GoodsReceiptDto();
        dto.setId(grn.getId());
        dto.setGrnCode(grn.getGrnCode());
        if (grn.getPurchaseOrder() != null) {
            dto.setPoId(grn.getPurchaseOrder().getId());
            dto.setPoCode(grn.getPurchaseOrder().getPoCode());
        }
        dto.setWarehouseId(grn.getWarehouse().getId());
        dto.setWarehouseCode(grn.getWarehouse().getCode());
        dto.setWarehouseName(grn.getWarehouse().getName());
        dto.setReceiptDate(grn.getReceiptDate());
        dto.setStatus(grn.getStatus());
        dto.setNotes(grn.getNotes());
        dto.setCreatedBy(grn.getCreatedBy());
        dto.setConfirmedBy(grn.getConfirmedBy());
        dto.setConfirmedAt(grn.getConfirmedAt());
        dto.setCreatedAt(grn.getCreatedAt());
        return dto;
    }

    public GoodsReceiptDto mapToDetailDto(GoodsReceiptNote grn) {
        GoodsReceiptDto dto = mapToSummaryDto(grn);

        List<GoodsReceiptItemDto> itemDtos = new ArrayList<>();
        if (grn.getItems() != null) {
            for (GoodsReceiptItem item : grn.getItems()) {
                GoodsReceiptItemDto itemDto = new GoodsReceiptItemDto();
                itemDto.setId(item.getId());
                itemDto.setProductId(item.getProduct().getId());
                itemDto.setProductSku(item.getProduct().getSku());
                itemDto.setProductName(item.getProduct().getName());
                itemDto.setProductUnit(item.getProduct().getUnit());
                itemDto.setOrderedQuantity(item.getOrderedQuantity());
                itemDto.setReceivedQuantity(item.getReceivedQuantity());
                itemDto.setUnitPrice(item.getUnitPrice());
                itemDto.setNotes(item.getNotes());
                itemDtos.add(itemDto);
            }
        }
        dto.setItems(itemDtos);
        return dto;
    }
}
