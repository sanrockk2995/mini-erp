package com.erp.modules.purchase.service;

import com.erp.common.PageResponse;
import com.erp.exception.BusinessException;
import com.erp.exception.ResourceNotFoundException;
import com.erp.modules.product.entity.Product;
import com.erp.modules.product.repository.ProductRepository;
import com.erp.modules.purchase.dto.PurchaseOrderDto;
import com.erp.modules.purchase.dto.PurchaseOrderItemDto;
import com.erp.modules.purchase.dto.PurchaseOrderItemRequest;
import com.erp.modules.purchase.dto.PurchaseOrderRequest;
import com.erp.modules.purchase.entity.PurchaseOrder;
import com.erp.modules.purchase.entity.PurchaseOrderItem;
import com.erp.modules.purchase.repository.PurchaseOrderRepository;
import com.erp.modules.supplier.entity.Supplier;
import com.erp.modules.supplier.repository.SupplierRepository;
import com.erp.modules.warehouse.entity.Warehouse;
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
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;

    public PurchaseOrderService(PurchaseOrderRepository purchaseOrderRepository,
                                SupplierRepository supplierRepository,
                                WarehouseRepository warehouseRepository,
                                ProductRepository productRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.supplierRepository = supplierRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<PurchaseOrderDto> searchOrders(Long supplierId, Long warehouseId, String status,
                                                      LocalDate fromDate, LocalDate toDate, String keyword,
                                                      int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<PurchaseOrder> poPage = purchaseOrderRepository.searchPurchaseOrders(
                supplierId, warehouseId, status, fromDate, toDate,
                keyword != null && !keyword.trim().isEmpty() ? keyword.trim() : null,
                pageable
        );

        List<PurchaseOrderDto> dtos = new ArrayList<>();
        for (PurchaseOrder po : poPage.getContent()) {
            dtos.add(mapToSummaryDto(po));
        }

        return new PageResponse<>(
                dtos,
                poPage.getNumber(),
                poPage.getSize(),
                poPage.getTotalElements(),
                poPage.getTotalPages(),
                poPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public PurchaseOrderDto getById(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn mua hàng", "id", id));
        return mapToDetailDto(po);
    }

    @Transactional
    public PurchaseOrderDto create(PurchaseOrderRequest request, String username) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Nhà cung cấp", "id", request.getSupplierId()));
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Kho", "id", request.getWarehouseId()));

        PurchaseOrder po = new PurchaseOrder();
        po.setPoCode(generatePoCode());
        po.setSupplier(supplier);
        po.setWarehouse(warehouse);
        po.setOrderDate(request.getOrderDate() != null ? request.getOrderDate() : LocalDate.now());
        po.setExpectedDate(request.getExpectedDate());
        po.setStatus("DRAFT");
        po.setCreatedBy(username != null ? username : "SYSTEM");
        po.setNotes(request.getNotes());
        po.setTaxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO);

        BigDecimal subtotal = BigDecimal.ZERO;

        for (PurchaseOrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", "id", itemReq.getProductId()));

            BigDecimal lineTotal = itemReq.getQuantity().multiply(itemReq.getUnitPrice());

            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setProduct(product);
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(itemReq.getUnitPrice());
            item.setLineTotal(lineTotal);

            po.addItem(item);
            subtotal = subtotal.add(lineTotal);
        }

        po.setSubtotal(subtotal);
        po.setTotalAmount(subtotal.add(po.getTaxAmount()));

        PurchaseOrder saved = purchaseOrderRepository.save(po);
        return mapToDetailDto(saved);
    }

    @Transactional
    public PurchaseOrderDto submitForApproval(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn mua hàng", "id", id));

        if (!"DRAFT".equals(po.getStatus())) {
            throw new BusinessException("Chỉ có thể gửi duyệt đơn mua đang ở trạng thái DRAFT");
        }

        po.setStatus("PENDING_APPROVAL");
        PurchaseOrder saved = purchaseOrderRepository.save(po);
        return mapToDetailDto(saved);
    }

    @Transactional
    public PurchaseOrderDto approve(Long id, String username) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn mua hàng", "id", id));

        if (!"PENDING_APPROVAL".equals(po.getStatus()) && !"DRAFT".equals(po.getStatus())) {
            throw new BusinessException("Chỉ có thể duyệt đơn mua ở trạng thái DRAFT hoặc PENDING_APPROVAL");
        }

        po.setStatus("APPROVED");
        po.setApprovedBy(username != null ? username : "SYSTEM");
        po.setApprovedAt(LocalDateTime.now());

        PurchaseOrder saved = purchaseOrderRepository.save(po);
        return mapToDetailDto(saved);
    }

    @Transactional
    public PurchaseOrderDto reject(Long id, String note, String username) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn mua hàng", "id", id));

        if (!"PENDING_APPROVAL".equals(po.getStatus()) && !"DRAFT".equals(po.getStatus())) {
            throw new BusinessException("Chỉ có thể từ chối đơn mua ở trạng thái DRAFT hoặc PENDING_APPROVAL");
        }

        po.setStatus("REJECTED");
        po.setNotes((po.getNotes() != null ? po.getNotes() + " | " : "") + "Từ chối: " + (note != null ? note : ""));
        PurchaseOrder saved = purchaseOrderRepository.save(po);
        return mapToDetailDto(saved);
    }

    @Transactional
    public PurchaseOrderDto close(Long id, String username) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn mua hàng", "id", id));

        if (!"RECEIVED".equals(po.getStatus())) {
            throw new BusinessException("Chỉ có thể đóng đơn mua sau khi đã nhận đủ hàng (RECEIVED)");
        }

        po.setStatus("CLOSED");
        PurchaseOrder saved = purchaseOrderRepository.save(po);
        return mapToDetailDto(saved);
    }

    private String generatePoCode() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int rand = ThreadLocalRandom.current().nextInt(1000, 9999);
        String code = "PO-" + datePart + "-" + rand;
        while (purchaseOrderRepository.existsByPoCode(code)) {
            rand = ThreadLocalRandom.current().nextInt(1000, 9999);
            code = "PO-" + datePart + "-" + rand;
        }
        return code;
    }

    public PurchaseOrderDto mapToSummaryDto(PurchaseOrder po) {
        PurchaseOrderDto dto = new PurchaseOrderDto();
        dto.setId(po.getId());
        dto.setPoCode(po.getPoCode());
        dto.setSupplierId(po.getSupplier().getId());
        dto.setSupplierCode(po.getSupplier().getCode());
        dto.setSupplierName(po.getSupplier().getName());
        dto.setWarehouseId(po.getWarehouse().getId());
        dto.setWarehouseCode(po.getWarehouse().getCode());
        dto.setWarehouseName(po.getWarehouse().getName());
        dto.setOrderDate(po.getOrderDate());
        dto.setExpectedDate(po.getExpectedDate());
        dto.setSubtotal(po.getSubtotal());
        dto.setTaxAmount(po.getTaxAmount());
        dto.setTotalAmount(po.getTotalAmount());
        dto.setStatus(po.getStatus());
        dto.setCreatedBy(po.getCreatedBy());
        dto.setApprovedBy(po.getApprovedBy());
        dto.setApprovedAt(po.getApprovedAt());
        dto.setNotes(po.getNotes());
        dto.setCreatedAt(po.getCreatedAt());
        return dto;
    }

    public PurchaseOrderDto mapToDetailDto(PurchaseOrder po) {
        PurchaseOrderDto dto = mapToSummaryDto(po);

        List<PurchaseOrderItemDto> itemDtos = new ArrayList<>();
        if (po.getItems() != null) {
            for (PurchaseOrderItem item : po.getItems()) {
                PurchaseOrderItemDto itemDto = new PurchaseOrderItemDto();
                itemDto.setId(item.getId());
                itemDto.setProductId(item.getProduct().getId());
                itemDto.setProductSku(item.getProduct().getSku());
                itemDto.setProductName(item.getProduct().getName());
                itemDto.setProductUnit(item.getProduct().getUnit());
                itemDto.setQuantity(item.getQuantity());
                itemDto.setUnitPrice(item.getUnitPrice());
                itemDto.setLineTotal(item.getLineTotal());
                itemDtos.add(itemDto);
            }
        }
        dto.setItems(itemDtos);
        return dto;
    }
}
