package com.erp.modules.product.controller;

import com.erp.common.ApiResponse;
import com.erp.common.PageResponse;
import com.erp.modules.product.dto.ProductDto;
import com.erp.modules.product.dto.ProductRequest;
import com.erp.modules.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Products", description = "Quản lý Sản phẩm, Hàng hóa và Thuộc tính")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @Operation(summary = "Tìm kiếm và phân trang sản phẩm", description = "Tìm kiếm theo từ khóa (tên/sku), lọc theo danh mục và trạng thái")
    public ResponseEntity<ApiResponse<PageResponse<ProductDto>>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<ProductDto> result = productService.search(keyword, categoryId, isActive, page, size);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/active")
    @Operation(summary = "Lấy tất cả sản phẩm đang hoạt động", description = "Dùng cho dropdown chọn sản phẩm khi tạo đơn hàng/phiếu nhập/xuất")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getAllActive() {
        return ResponseEntity.ok(ApiResponse.ok(productService.getAllActive()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết sản phẩm theo ID")
    public ResponseEntity<ApiResponse<ProductDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Tạo mới sản phẩm kèm thuộc tính linh hoạt")
    public ResponseEntity<ApiResponse<ProductDto>> create(@Valid @RequestBody ProductRequest request) {
        ProductDto created = productService.create(request);
        return ResponseEntity.ok(ApiResponse.ok("Tạo sản phẩm thành công", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin sản phẩm và thuộc tính")
    public ResponseEntity<ApiResponse<ProductDto>> update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        ProductDto updated = productService.update(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật sản phẩm thành công", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa sản phẩm")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa sản phẩm thành công", null));
    }
}
