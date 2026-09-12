package com.erp.modules.customer.controller;

import com.erp.common.ApiResponse;
import com.erp.modules.customer.dto.CustomerGroupDto;
import com.erp.modules.customer.dto.CustomerGroupRequest;
import com.erp.modules.customer.service.CustomerGroupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer-groups")
@Tag(name = "Customer Groups", description = "Quản lý Phân loại và Chính sách Chiết khấu Nhóm Khách hàng")
public class CustomerGroupController {

    private final CustomerGroupService customerGroupService;

    public CustomerGroupController(CustomerGroupService customerGroupService) {
        this.customerGroupService = customerGroupService;
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả các nhóm khách hàng")
    public ResponseEntity<ApiResponse<List<CustomerGroupDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(customerGroupService.getAll()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết nhóm khách hàng theo ID")
    public ResponseEntity<ApiResponse<CustomerGroupDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(customerGroupService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Tạo mới nhóm khách hàng")
    public ResponseEntity<ApiResponse<CustomerGroupDto>> create(@Valid @RequestBody CustomerGroupRequest request) {
        CustomerGroupDto created = customerGroupService.create(request);
        return ResponseEntity.ok(ApiResponse.ok("Tạo nhóm khách hàng thành công", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật nhóm khách hàng")
    public ResponseEntity<ApiResponse<CustomerGroupDto>> update(@PathVariable Long id, @Valid @RequestBody CustomerGroupRequest request) {
        CustomerGroupDto updated = customerGroupService.update(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật nhóm khách hàng thành công", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa nhóm khách hàng")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        customerGroupService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa nhóm khách hàng thành công", null));
    }
}
