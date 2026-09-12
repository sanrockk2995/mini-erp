package com.erp.modules.supplier.controller;

import com.erp.common.ApiResponse;
import com.erp.common.PageResponse;
import com.erp.modules.supplier.dto.*;
import com.erp.modules.supplier.service.SupplierService;
import com.erp.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@Tag(name = "Supplier Management", description = "Quản lý nhà cung cấp, đánh giá xếp hạng và theo dõi công nợ")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping
    @Operation(summary = "Tìm kiếm và phân trang danh sách nhà cung cấp")
    public ResponseEntity<ApiResponse<PageResponse<SupplierDto>>> search(
            @RequestParam(required = false) String tier,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                supplierService.searchSuppliers(tier, isActive, keyword, page, size)
        ));
    }

    @GetMapping("/active")
    @Operation(summary = "Lấy danh sách tất cả NCC đang hoạt động (dùng cho dropdown)")
    public ResponseEntity<ApiResponse<List<SupplierDto>>> getActive() {
        return ResponseEntity.ok(ApiResponse.ok(supplierService.getAllActive()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin chi tiết NCC (bao gồm công nợ hiện tại)")
    public ResponseEntity<ApiResponse<SupplierDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(supplierService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASING')")
    @Operation(summary = "Tạo mới nhà cung cấp")
    public ResponseEntity<ApiResponse<SupplierDto>> create(@Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Tạo nhà cung cấp thành công", supplierService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASING')")
    @Operation(summary = "Cập nhật thông tin nhà cung cấp")
    public ResponseEntity<ApiResponse<SupplierDto>> update(@PathVariable Long id, @Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật nhà cung cấp thành công", supplierService.update(id, request)));
    }

    @PostMapping("/{id}/reviews")
    @PreAuthorize("hasAnyRole('ADMIN', 'PURCHASING')")
    @Operation(summary = "Đánh giá nhà cung cấp (Tự động tính điểm bình quân & cập nhật hạng A/B/C)")
    public ResponseEntity<ApiResponse<SupplierReviewDto>> addReview(
            @PathVariable Long id,
            @Valid @RequestBody SupplierReviewRequest request,
            Authentication authentication) {
        Long reviewerId = null;
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            reviewerId = principal.getId();
        }
        return ResponseEntity.ok(ApiResponse.ok("Thêm đánh giá thành công", supplierService.addReview(id, request, reviewerId)));
    }

    @GetMapping("/{id}/reviews")
    @Operation(summary = "Xem lịch sử đánh giá của nhà cung cấp")
    public ResponseEntity<ApiResponse<List<SupplierReviewDto>>> getReviews(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(supplierService.getReviews(id)));
    }

    @GetMapping("/{id}/debt-summary")
    @Operation(summary = "Tóm tắt công nợ nhà cung cấp")
    public ResponseEntity<ApiResponse<SupplierDebtSummaryDto>> getDebtSummary(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(supplierService.getDebtSummary(id)));
    }
}
