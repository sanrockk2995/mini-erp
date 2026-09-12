package com.erp.modules.warehouse.controller;

import com.erp.common.ApiResponse;
import com.erp.common.PageResponse;
import com.erp.modules.warehouse.dto.GoodsReceiptDto;
import com.erp.modules.warehouse.dto.GoodsReceiptRequest;
import com.erp.modules.warehouse.service.GoodsReceiptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/goods-receipts")
@Tag(name = "Goods Receipt Management", description = "Quản lý phiếu nhập kho (GRN) và nhập hàng theo đơn mua")
public class GoodsReceiptController {

    private final GoodsReceiptService goodsReceiptService;

    public GoodsReceiptController(GoodsReceiptService goodsReceiptService) {
        this.goodsReceiptService = goodsReceiptService;
    }

    @GetMapping
    @Operation(summary = "Tìm kiếm và phân trang phiếu nhập kho")
    public ResponseEntity<ApiResponse<PageResponse<GoodsReceiptDto>>> searchReceipts(
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                goodsReceiptService.searchReceipts(warehouseId, status, keyword, page, size)
        ));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết phiếu nhập kho theo ID kèm danh mục hàng hóa")
    public ResponseEntity<ApiResponse<GoodsReceiptDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(goodsReceiptService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE')")
    @Operation(summary = "Tạo mới phiếu nhập kho (Trạng thái DRAFT)")
    public ResponseEntity<ApiResponse<GoodsReceiptDto>> create(
            @Valid @RequestBody GoodsReceiptRequest request,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok("Tạo phiếu nhập kho thành công", goodsReceiptService.create(request, username)));
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE')")
    @Operation(summary = "Xác nhận nhập kho (Tăng tồn kho khả dụng, ghi sổ cái kho, cập nhật PO và tạo công nợ NCC)")
    public ResponseEntity<ApiResponse<GoodsReceiptDto>> confirm(
            @PathVariable Long id,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok("Xác nhận nhập kho thành công", goodsReceiptService.confirm(id, username)));
    }
}
