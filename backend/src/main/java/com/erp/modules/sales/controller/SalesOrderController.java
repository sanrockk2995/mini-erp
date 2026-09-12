package com.erp.modules.sales.controller;

import com.erp.common.ApiResponse;
import com.erp.common.PageResponse;
import com.erp.modules.sales.dto.SalesOrderDto;
import com.erp.modules.sales.dto.SalesOrderRequest;
import com.erp.modules.sales.dto.SalesOrderStatusUpdateDto;
import com.erp.modules.sales.service.SalesOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/sales-orders")
@Tag(name = "Sales Order Management", description = "Quản lý đơn đặt hàng bán và quy trình xuất bán")
public class SalesOrderController {

    private final SalesOrderService salesOrderService;

    public SalesOrderController(SalesOrderService salesOrderService) {
        this.salesOrderService = salesOrderService;
    }

    @GetMapping
    @Operation(summary = "Tìm kiếm và phân trang đơn đặt hàng bán")
    public ResponseEntity<ApiResponse<PageResponse<SalesOrderDto>>> searchOrders(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                salesOrderService.searchOrders(customerId, warehouseId, status, fromDate, toDate, keyword, page, size)
        ));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết đơn đặt hàng theo ID (kèm danh sách món và lịch sử trạng thái)")
    public ResponseEntity<ApiResponse<SalesOrderDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(salesOrderService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES')")
    @Operation(summary = "Tạo mới đơn đặt hàng bán (Trạng thái DRAFT)")
    public ResponseEntity<ApiResponse<SalesOrderDto>> create(
            @Valid @RequestBody SalesOrderRequest request,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok("Tạo đơn hàng thành công", salesOrderService.create(request, username)));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES')")
    @Operation(summary = "Duyệt đơn hàng bán (Tự động giữ chỗ kho và sinh Phiếu xuất kho DRAFT)")
    public ResponseEntity<ApiResponse<SalesOrderDto>> approve(
            @PathVariable Long id,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok("Duyệt đơn hàng thành công", salesOrderService.approve(id, username)));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES')")
    @Operation(summary = "Hủy đơn hàng bán (Hoàn trả lượng giữ chỗ kho nếu đã duyệt)")
    public ResponseEntity<ApiResponse<SalesOrderDto>> cancel(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "SYSTEM";
        String note = body != null ? body.get("note") : null;
        return ResponseEntity.ok(ApiResponse.ok("Hủy đơn hàng thành công", salesOrderService.cancel(id, note, username)));
    }

    @PostMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SALES', 'WAREHOUSE')")
    @Operation(summary = "Cập nhật trạng thái đơn hàng (DELIVERING, COMPLETED...)")
    public ResponseEntity<ApiResponse<SalesOrderDto>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody SalesOrderStatusUpdateDto dto,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái thành công", salesOrderService.updateStatus(id, dto, username)));
    }
}
