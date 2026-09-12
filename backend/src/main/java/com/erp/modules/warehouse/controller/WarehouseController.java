package com.erp.modules.warehouse.controller;

import com.erp.common.ApiResponse;
import com.erp.modules.warehouse.dto.WarehouseDto;
import com.erp.modules.warehouse.dto.WarehouseRequest;
import com.erp.modules.warehouse.service.WarehouseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouses")
@Tag(name = "Warehouse Management", description = "Quản lý danh mục kho hàng")
public class WarehouseController {

    private final WarehouseService warehouseService;

    public WarehouseController(WarehouseService warehouseService) {
        this.warehouseService = warehouseService;
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả kho")
    public ResponseEntity<ApiResponse<List<WarehouseDto>>> getAll(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
        List<WarehouseDto> list = activeOnly ? warehouseService.getActive() : warehouseService.getAll();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết kho theo ID")
    public ResponseEntity<ApiResponse<WarehouseDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(warehouseService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE')")
    @Operation(summary = "Tạo mới kho hàng")
    public ResponseEntity<ApiResponse<WarehouseDto>> create(@Valid @RequestBody WarehouseRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Tạo kho hàng thành công", warehouseService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSE')")
    @Operation(summary = "Cập nhật kho hàng")
    public ResponseEntity<ApiResponse<WarehouseDto>> update(@PathVariable Long id, @Valid @RequestBody WarehouseRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật kho hàng thành công", warehouseService.update(id, request)));
    }
}
