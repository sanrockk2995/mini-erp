package com.erp.modules.warehouse.controller;

import com.erp.common.ApiResponse;
import com.erp.common.PageResponse;
import com.erp.modules.warehouse.dto.InventoryDto;
import com.erp.modules.warehouse.dto.StockAdjustmentRequest;
import com.erp.modules.warehouse.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@Tag(name = "Inventory Management", description = "Quản lý tồn kho và điều chỉnh kho")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    @Operation(summary = "Tìm kiếm và phân trang tồn kho theo kho và sản phẩm")
    public ResponseEntity<ApiResponse<PageResponse<InventoryDto>>> searchInventory(
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.searchInventory(warehouseId, keyword, page, size)));
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Danh sách cảnh báo sản phẩm sắp hết hàng (tồn kho dưới định mức)")
    public ResponseEntity<ApiResponse<List<InventoryDto>>> getLowStockAlerts() {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getLowStockAlerts()));
    }

    @PostMapping("/adjust")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE')")
    @Operation(summary = "Điều chỉnh tồn kho thủ công (IN / OUT)")
    public ResponseEntity<ApiResponse<Void>> adjustStock(
            @Valid @RequestBody StockAdjustmentRequest request,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "SYSTEM";
        inventoryService.adjustStock(request, username);
        return ResponseEntity.ok(ApiResponse.ok("Điều chỉnh tồn kho thành công", null));
    }
}
