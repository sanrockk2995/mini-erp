package com.erp.modules.purchase.controller;

import com.erp.common.ApiResponse;
import com.erp.common.PageResponse;
import com.erp.modules.purchase.dto.PurchaseOrderDto;
import com.erp.modules.purchase.dto.PurchaseOrderRequest;
import com.erp.modules.purchase.service.PurchaseOrderService;
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
@RequestMapping("/api/purchase-orders")
@Tag(name = "Purchase Order Management", description = "Quản lý đơn mua hàng và quy trình phê duyệt mua hàng")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    public PurchaseOrderController(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    @GetMapping
    @Operation(summary = "Tìm kiếm và phân trang đơn mua hàng")
    public ResponseEntity<ApiResponse<PageResponse<PurchaseOrderDto>>> searchOrders(
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                purchaseOrderService.searchOrders(supplierId, warehouseId, status, fromDate, toDate, keyword, page, size)
        ));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết đơn mua hàng theo ID kèm danh sách sản phẩm")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(purchaseOrderService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASING')")
    @Operation(summary = "Tạo mới đơn mua hàng (Trạng thái DRAFT)")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> create(
            @Valid @RequestBody PurchaseOrderRequest request,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok("Tạo đơn mua hàng thành công", purchaseOrderService.create(request, username)));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASING')")
    @Operation(summary = "Gửi duyệt đơn mua hàng (Chuyển sang PENDING_APPROVAL)")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> submitForApproval(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Gửi duyệt thành công", purchaseOrderService.submitForApproval(id)));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASING')")
    @Operation(summary = "Duyệt đơn mua hàng (Chuyển sang APPROVED)")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> approve(
            @PathVariable Long id,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok("Duyệt đơn mua hàng thành công", purchaseOrderService.approve(id, username)));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASING')")
    @Operation(summary = "Từ chối duyệt đơn mua hàng")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> reject(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "SYSTEM";
        String note = body != null ? body.get("note") : null;
        return ResponseEntity.ok(ApiResponse.ok("Từ chối đơn mua thành công", purchaseOrderService.reject(id, note, username)));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASING')")
    @Operation(summary = "Đóng đơn mua hàng đã nhận đủ hàng")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> close(
            @PathVariable Long id,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok("Đóng đơn mua hàng thành công", purchaseOrderService.close(id, username)));
    }
}
