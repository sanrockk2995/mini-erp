package com.erp.modules.sales.service;

import com.erp.common.PageResponse;
import com.erp.exception.BusinessException;
import com.erp.exception.ResourceNotFoundException;
import com.erp.modules.customer.entity.Customer;
import com.erp.modules.customer.repository.CustomerRepository;
import com.erp.modules.product.entity.Product;
import com.erp.modules.product.repository.ProductRepository;
import com.erp.modules.sales.dto.*;
import com.erp.modules.sales.entity.SalesOrder;
import com.erp.modules.sales.entity.SalesOrderItem;
import com.erp.modules.sales.entity.SalesOrderStatusHistory;
import com.erp.modules.sales.repository.SalesOrderItemRepository;
import com.erp.modules.sales.repository.SalesOrderRepository;
import com.erp.modules.sales.repository.SalesOrderStatusHistoryRepository;
import com.erp.modules.warehouse.entity.GoodsIssueItem;
import com.erp.modules.warehouse.entity.GoodsIssueNote;
import com.erp.modules.warehouse.entity.Warehouse;
import com.erp.modules.warehouse.repository.GoodsIssueNoteRepository;
import com.erp.modules.warehouse.repository.WarehouseRepository;
import com.erp.modules.warehouse.service.InventoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class SalesOrderService {

    private final SalesOrderRepository salesOrderRepository;
    private final SalesOrderItemRepository salesOrderItemRepository;
    private final SalesOrderStatusHistoryRepository statusHistoryRepository;
    private final CustomerRepository customerRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final GoodsIssueNoteRepository goodsIssueNoteRepository;

    public SalesOrderService(SalesOrderRepository salesOrderRepository,
                             SalesOrderItemRepository salesOrderItemRepository,
                             SalesOrderStatusHistoryRepository statusHistoryRepository,
                             CustomerRepository customerRepository,
                             WarehouseRepository warehouseRepository,
                             ProductRepository productRepository,
                             InventoryService inventoryService,
                             GoodsIssueNoteRepository goodsIssueNoteRepository) {
        this.salesOrderRepository = salesOrderRepository;
        this.salesOrderItemRepository = salesOrderItemRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.customerRepository = customerRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
        this.inventoryService = inventoryService;
        this.goodsIssueNoteRepository = goodsIssueNoteRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<SalesOrderDto> searchOrders(Long customerId, Long warehouseId, String status,
                                                   LocalDate fromDate, LocalDate toDate, String keyword,
                                                   int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<SalesOrder> orderPage = salesOrderRepository.searchSalesOrders(
                customerId, warehouseId, status, fromDate, toDate,
                keyword != null && !keyword.trim().isEmpty() ? keyword.trim() : null,
                pageable
        );

        List<SalesOrderDto> dtos = new ArrayList<>();
        for (SalesOrder order : orderPage.getContent()) {
            dtos.add(mapToSummaryDto(order));
        }

        return new PageResponse<>(
                dtos,
                orderPage.getNumber(),
                orderPage.getSize(),
                orderPage.getTotalElements(),
                orderPage.getTotalPages(),
                orderPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public SalesOrderDto getById(Long id) {
        SalesOrder order = salesOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", "id", id));
        return mapToDetailDto(order);
    }

    @Transactional
    public SalesOrderDto create(SalesOrderRequest request, String username) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", "id", request.getCustomerId()));
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Kho", "id", request.getWarehouseId()));

        SalesOrder order = new SalesOrder();
        order.setOrderCode(generateOrderCode());
        order.setCustomer(customer);
        order.setWarehouse(warehouse);
        order.setOrderDate(request.getOrderDate() != null ? request.getOrderDate() : LocalDate.now());
        order.setStatus("DRAFT");
        order.setCreatedBy(username != null ? username : "SYSTEM");
        order.setNotes(request.getNotes());
        order.setTaxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO);
        order.setDiscountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO);

        BigDecimal subtotal = BigDecimal.ZERO;

        for (SalesOrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", "id", itemReq.getProductId()));

            BigDecimal discountPct = itemReq.getDiscountPercent() != null ? itemReq.getDiscountPercent() : BigDecimal.ZERO;
            BigDecimal baseTotal = itemReq.getQuantity().multiply(itemReq.getUnitPrice());
            BigDecimal discountVal = baseTotal.multiply(discountPct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal lineTotal = baseTotal.subtract(discountVal);

            SalesOrderItem item = new SalesOrderItem();
            item.setProduct(product);
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(itemReq.getUnitPrice());
            item.setDiscountPercent(discountPct);
            item.setLineTotal(lineTotal);

            order.addItem(item);
            subtotal = subtotal.add(lineTotal);
        }

        order.setSubtotal(subtotal);
        order.setTotalAmount(subtotal.add(order.getTaxAmount()).subtract(order.getDiscountAmount()));

        SalesOrder saved = salesOrderRepository.save(order);

        // Lưu lịch sử trạng thái ban đầu
        SalesOrderStatusHistory history = new SalesOrderStatusHistory(
                saved, null, "DRAFT", "Tạo đơn hàng mới", order.getCreatedBy()
        );
        statusHistoryRepository.save(history);

        return mapToDetailDto(saved);
    }

    @Transactional
    public SalesOrderDto approve(Long id, String username) {
        SalesOrder order = salesOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", "id", id));

        if (!"DRAFT".equals(order.getStatus())) {
            throw new BusinessException("Chỉ có thể duyệt đơn hàng đang ở trạng thái DRAFT");
        }

        // Kiểm tra và đặt chỗ tồn kho (Reserve Stock) cho từng sản phẩm
        for (SalesOrderItem item : order.getItems()) {
            inventoryService.reserveStock(order.getWarehouse().getId(), item.getProduct().getId(), item.getQuantity());
        }

        String oldStatus = order.getStatus();
        order.setStatus("APPROVED");
        order.setApprovedBy(username != null ? username : "SYSTEM");
        order.setApprovedAt(LocalDateTime.now());
        salesOrderRepository.save(order);

        // Ghi nhận lịch sử chuyển trạng thái
        SalesOrderStatusHistory history = new SalesOrderStatusHistory(
                order, oldStatus, "APPROVED", "Duyệt đơn hàng và tự động giữ chỗ kho", username
        );
        statusHistoryRepository.save(history);

        // Tự động sinh Phiếu xuất kho (GoodsIssueNote) ở trạng thái DRAFT
        GoodsIssueNote gin = new GoodsIssueNote();
        gin.setGinCode(generateGinCode());
        gin.setSalesOrder(order);
        gin.setWarehouse(order.getWarehouse());
        gin.setIssueDate(LocalDate.now());
        gin.setIssueType("SALES_ORDER");
        gin.setStatus("DRAFT");
        gin.setNotes("Tự động sinh từ đơn hàng: " + order.getOrderCode());
        gin.setCreatedBy(username != null ? username : "SYSTEM");

        for (SalesOrderItem item : order.getItems()) {
            GoodsIssueItem gii = new GoodsIssueItem();
            gii.setProduct(item.getProduct());
            gii.setRequestedQuantity(item.getQuantity());
            gii.setIssuedQuantity(BigDecimal.ZERO);
            gii.setNotes("Theo đơn " + order.getOrderCode());
            gin.addItem(gii);
        }
        goodsIssueNoteRepository.save(gin);

        return mapToDetailDto(order);
    }

    @Transactional
    public SalesOrderDto cancel(Long id, String note, String username) {
        SalesOrder order = salesOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", "id", id));

        if ("COMPLETED".equals(order.getStatus()) || "DELIVERING".equals(order.getStatus())) {
            throw new BusinessException("Không thể hủy đơn hàng đang giao hoặc đã hoàn thành");
        }

        if ("CANCELLED".equals(order.getStatus())) {
            throw new BusinessException("Đơn hàng đã bị hủy trước đó");
        }

        // Nếu đơn hàng đã APPROVED, phải hoàn trả số lượng reserved trong kho
        if ("APPROVED".equals(order.getStatus())) {
            for (SalesOrderItem item : order.getItems()) {
                inventoryService.releaseReservedStock(order.getWarehouse().getId(), item.getProduct().getId(), item.getQuantity());
            }

            // Hủy phiếu xuất kho liên quan nếu đang là DRAFT
            Optional<GoodsIssueNote> ginOpt = goodsIssueNoteRepository.findBySalesOrderId(order.getId());
            if (ginOpt.isPresent()) {
                GoodsIssueNote gin = ginOpt.get();
                if ("DRAFT".equals(gin.getStatus())) {
                    gin.setStatus("CANCELLED");
                    gin.setNotes((gin.getNotes() != null ? gin.getNotes() + " | " : "") + "Hủy do đơn hàng bị hủy");
                    goodsIssueNoteRepository.save(gin);
                }
            }
        }

        String oldStatus = order.getStatus();
        order.setStatus("CANCELLED");
        salesOrderRepository.save(order);

        SalesOrderStatusHistory history = new SalesOrderStatusHistory(
                order, oldStatus, "CANCELLED", note != null ? note : "Hủy đơn hàng", username
        );
        statusHistoryRepository.save(history);

        return mapToDetailDto(order);
    }

    @Transactional
    public SalesOrderDto updateStatus(Long id, SalesOrderStatusUpdateDto dto, String username) {
        SalesOrder order = salesOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", "id", id));

        String oldStatus = order.getStatus();
        String newStatus = dto.getStatus();

        if (oldStatus.equals(newStatus)) {
            return mapToDetailDto(order);
        }

        // Validate valid transitions
        if ("COMPLETED".equals(newStatus) && !"DELIVERING".equals(oldStatus) && !"APPROVED".equals(oldStatus)) {
            throw new BusinessException("Chỉ có thể hoàn tất đơn hàng đang giao hoặc đã duyệt");
        }

        order.setStatus(newStatus);
        salesOrderRepository.save(order);

        SalesOrderStatusHistory history = new SalesOrderStatusHistory(
                order, oldStatus, newStatus, dto.getNote(), username
        );
        statusHistoryRepository.save(history);

        return mapToDetailDto(order);
    }

    private String generateOrderCode() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int rand = ThreadLocalRandom.current().nextInt(1000, 9999);
        String code = "SO-" + datePart + "-" + rand;
        while (salesOrderRepository.existsByOrderCode(code)) {
            rand = ThreadLocalRandom.current().nextInt(1000, 9999);
            code = "SO-" + datePart + "-" + rand;
        }
        return code;
    }

    private String generateGinCode() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int rand = ThreadLocalRandom.current().nextInt(1000, 9999);
        String code = "GIN-" + datePart + "-" + rand;
        while (goodsIssueNoteRepository.existsByGinCode(code)) {
            rand = ThreadLocalRandom.current().nextInt(1000, 9999);
            code = "GIN-" + datePart + "-" + rand;
        }
        return code;
    }

    public SalesOrderDto mapToSummaryDto(SalesOrder order) {
        SalesOrderDto dto = new SalesOrderDto();
        dto.setId(order.getId());
        dto.setOrderCode(order.getOrderCode());
        dto.setCustomerId(order.getCustomer().getId());
        dto.setCustomerCode(order.getCustomer().getCode());
        dto.setCustomerName(order.getCustomer().getName());
        dto.setCustomerPhone(order.getCustomer().getPhone());
        dto.setWarehouseId(order.getWarehouse().getId());
        dto.setWarehouseCode(order.getWarehouse().getCode());
        dto.setWarehouseName(order.getWarehouse().getName());
        dto.setOrderDate(order.getOrderDate());
        dto.setSubtotal(order.getSubtotal());
        dto.setTaxAmount(order.getTaxAmount());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setCreatedBy(order.getCreatedBy());
        dto.setApprovedBy(order.getApprovedBy());
        dto.setApprovedAt(order.getApprovedAt());
        dto.setNotes(order.getNotes());
        dto.setCreatedAt(order.getCreatedAt());
        return dto;
    }

    public SalesOrderDto mapToDetailDto(SalesOrder order) {
        SalesOrderDto dto = mapToSummaryDto(order);

        List<SalesOrderItemDto> itemDtos = new ArrayList<>();
        if (order.getItems() != null) {
            for (SalesOrderItem item : order.getItems()) {
                SalesOrderItemDto itemDto = new SalesOrderItemDto();
                itemDto.setId(item.getId());
                itemDto.setProductId(item.getProduct().getId());
                itemDto.setProductSku(item.getProduct().getSku());
                itemDto.setProductName(item.getProduct().getName());
                itemDto.setProductUnit(item.getProduct().getUnit());
                itemDto.setQuantity(item.getQuantity());
                itemDto.setUnitPrice(item.getUnitPrice());
                itemDto.setDiscountPercent(item.getDiscountPercent());
                itemDto.setLineTotal(item.getLineTotal());
                itemDtos.add(itemDto);
            }
        }
        dto.setItems(itemDtos);

        List<SalesOrderStatusHistoryDto> histDtos = new ArrayList<>();
        List<SalesOrderStatusHistory> histories = statusHistoryRepository.findBySalesOrderIdOrderByChangedAtAsc(order.getId());
        for (SalesOrderStatusHistory h : histories) {
            SalesOrderStatusHistoryDto hDto = new SalesOrderStatusHistoryDto();
            hDto.setId(h.getId());
            hDto.setFromStatus(h.getFromStatus());
            hDto.setToStatus(h.getToStatus());
            hDto.setNote(h.getNote());
            hDto.setChangedBy(h.getChangedBy());
            hDto.setChangedAt(h.getChangedAt());
            histDtos.add(hDto);
        }
        dto.setStatusHistories(histDtos);

        return dto;
    }
}
