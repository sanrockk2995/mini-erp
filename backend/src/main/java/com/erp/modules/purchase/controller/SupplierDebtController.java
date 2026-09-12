package com.erp.modules.purchase.controller;

import com.erp.common.ApiResponse;
import com.erp.common.PageResponse;
import com.erp.modules.purchase.dto.SupplierDebtDto;
import com.erp.modules.purchase.dto.SupplierPaymentDto;
import com.erp.modules.purchase.dto.SupplierPaymentRequest;
import com.erp.modules.purchase.service.SupplierDebtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/supplier-debts")
@Tag(name = "Supplier Debt & Payment Management", description = "Quản lý công nợ phải trả NCC và ghi nhận thanh toán")
public class SupplierDebtController {

    private final SupplierDebtService supplierDebtService;

    public SupplierDebtController(SupplierDebtService supplierDebtService) {
        this.supplierDebtService = supplierDebtService;
    }

    @GetMapping
    @Operation(summary = "Tìm kiếm và phân trang công nợ nhà cung cấp")
    public ResponseEntity<ApiResponse<PageResponse<SupplierDebtDto>>> searchDebts(
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                supplierDebtService.searchDebts(supplierId, status, keyword, page, size)
        ));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết khoản công nợ theo ID")
    public ResponseEntity<ApiResponse<SupplierDebtDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(supplierDebtService.getById(id)));
    }

    @GetMapping("/{id}/payments")
    @Operation(summary = "Xem lịch sử các đợt thanh toán của khoản nợ")
    public ResponseEntity<ApiResponse<List<SupplierPaymentDto>>> getPayments(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(supplierDebtService.getPaymentsByDebt(id)));
    }

    @PostMapping("/payments")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'PURCHASING')")
    @Operation(summary = "Ghi nhận thanh toán tiền cho nhà cung cấp (Trừ công nợ tương ứng)")
    public ResponseEntity<ApiResponse<SupplierPaymentDto>> recordPayment(
            @Valid @RequestBody SupplierPaymentRequest request,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok("Ghi nhận thanh toán thành công", supplierDebtService.recordPayment(request, username)));
    }
}
