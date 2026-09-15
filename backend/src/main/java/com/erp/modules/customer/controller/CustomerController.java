package com.erp.modules.customer.controller;

import com.erp.common.ApiResponse;
import com.erp.common.PageResponse;
import com.erp.modules.customer.dto.CustomerDto;
import com.erp.modules.customer.dto.CustomerPurchaseHistoryDto;
import com.erp.modules.customer.dto.CustomerRequest;
import com.erp.modules.customer.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@Tag(name = "Customers", description = "Quản lý Khách hàng, Phân loại và Lịch sử Mua hàng")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    @Operation(summary = "Tìm kiếm và phân trang khách hàng", description = "Tìm kiếm theo từ khóa (tên/mã/SĐT), lọc theo nhóm khách hàng và trạng thái")
    public ResponseEntity<ApiResponse<PageResponse<CustomerDto>>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String groupName,
            @RequestParam(required = false) Long groupId,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        String filterGroup = groupName;
        if (filterGroup == null && groupId != null) {
            // Map legacy groupId to standard group names if applicable
            if (groupId == 1L) filterGroup = "Khách Hàng Mua Lẻ";
            else if (groupId == 2L) filterGroup = "Khách Hàng Thân Thiết VIP";
            else if (groupId == 3L) filterGroup = "Khách Hàng Mua Buôn / Đại Lý";
        }
        PageResponse<CustomerDto> result = customerService.search(keyword, filterGroup, isActive, page, size);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/active")
    @Operation(summary = "Lấy tất cả khách hàng đang hoạt động", description = "Dùng cho dropdown chọn khách hàng khi lập đơn bán")
    public ResponseEntity<ApiResponse<List<CustomerDto>>> getAllActive() {
        return ResponseEntity.ok(ApiResponse.ok(customerService.getAllActive()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết khách hàng theo ID")
    public ResponseEntity<ApiResponse<CustomerDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(customerService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Tạo mới khách hàng")
    public ResponseEntity<ApiResponse<CustomerDto>> create(@Valid @RequestBody CustomerRequest request) {
        CustomerDto created = customerService.create(request);
        return ResponseEntity.ok(ApiResponse.ok("Tạo khách hàng thành công", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin khách hàng")
    public ResponseEntity<ApiResponse<CustomerDto>> update(@PathVariable Long id, @Valid @RequestBody CustomerRequest request) {
        CustomerDto updated = customerService.update(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật khách hàng thành công", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa khách hàng")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        customerService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa khách hàng thành công", null));
    }

    @GetMapping("/{id}/purchase-history")
    @Operation(summary = "Lịch sử mua hàng của khách hàng", description = "Thống kê tổng số đơn hàng, tổng chi tiêu, ngày mua gần nhất và danh sách đơn hàng")
    public ResponseEntity<ApiResponse<CustomerPurchaseHistoryDto>> getPurchaseHistory(@PathVariable Long id) {
        CustomerPurchaseHistoryDto history = customerService.getPurchaseHistory(id);
        return ResponseEntity.ok(ApiResponse.ok(history));
    }
}
