package com.erp.modules.warehouse.controller;

import com.erp.common.ApiResponse;
import com.erp.common.PageResponse;
import com.erp.modules.warehouse.dto.GoodsIssueDto;
import com.erp.modules.warehouse.dto.GoodsIssueRequest;
import com.erp.modules.warehouse.service.GoodsIssueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/goods-issues")
@Tag(name = "Goods Issue Management", description = "Quản lý phiếu xuất kho (GIN) và xuất hàng theo đơn bán")
public class GoodsIssueController {

    private final GoodsIssueService goodsIssueService;

    public GoodsIssueController(GoodsIssueService goodsIssueService) {
        this.goodsIssueService = goodsIssueService;
    }

    @GetMapping
    @Operation(summary = "Tìm kiếm và phân trang phiếu xuất kho")
    public ResponseEntity<ApiResponse<PageResponse<GoodsIssueDto>>> searchIssues(
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                goodsIssueService.searchIssues(warehouseId, status, keyword, page, size)
        ));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết phiếu xuất kho theo ID kèm danh mục hàng hóa")
    public ResponseEntity<ApiResponse<GoodsIssueDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(goodsIssueService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE')")
    @Operation(summary = "Tạo mới phiếu xuất kho thủ công (Trạng thái DRAFT)")
    public ResponseEntity<ApiResponse<GoodsIssueDto>> create(
            @Valid @RequestBody GoodsIssueRequest request,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok("Tạo phiếu xuất kho thành công", goodsIssueService.create(request, username)));
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE')")
    @Operation(summary = "Xác nhận xuất kho (Trừ tồn kho khả dụng & giữ chỗ, ghi sổ cái kho, cập nhật đơn bán sang DELIVERING)")
    public ResponseEntity<ApiResponse<GoodsIssueDto>> confirm(
            @PathVariable Long id,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok("Xác nhận xuất kho thành công", goodsIssueService.confirm(id, username)));
    }
}
