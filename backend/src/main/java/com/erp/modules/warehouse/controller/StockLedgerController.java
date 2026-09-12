package com.erp.modules.warehouse.controller;

import com.erp.common.ApiResponse;
import com.erp.common.PageResponse;
import com.erp.modules.warehouse.dto.StockLedgerDto;
import com.erp.modules.warehouse.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stock-ledger")
@Tag(name = "Stock Ledger Management", description = "Sổ cái biến động kho (Audit trail biến động xuất nhập kho)")
public class StockLedgerController {

    private final InventoryService inventoryService;

    public StockLedgerController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    @Operation(summary = "Xem lịch sử biến động sổ cái kho")
    public ResponseEntity<ApiResponse<PageResponse<StockLedgerDto>>> getStockLedger(
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) String transactionType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                inventoryService.getStockLedger(warehouseId, productId, transactionType, page, size)
        ));
    }
}
