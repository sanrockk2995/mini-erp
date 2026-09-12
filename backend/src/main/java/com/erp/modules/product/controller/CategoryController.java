package com.erp.modules.product.controller;

import com.erp.common.ApiResponse;
import com.erp.modules.product.dto.CategoryDto;
import com.erp.modules.product.dto.CategoryRequest;
import com.erp.modules.product.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Product Categories", description = "Quản lý Cây Danh mục Sản phẩm")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping("/tree")
    @Operation(summary = "Lấy cây danh mục sản phẩm", description = "Trả về danh mục dạng cấu trúc cây (parent - children)")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getCategoryTree() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getCategoryTree()));
    }

    @GetMapping
    @Operation(summary = "Lấy toàn bộ danh mục dạng phẳng", description = "Trả về danh sách danh mục phẳng sắp xếp theo sort_order")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAllFlat() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getAllFlat()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết danh mục theo ID")
    public ResponseEntity<ApiResponse<CategoryDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Tạo mới danh mục sản phẩm")
    public ResponseEntity<ApiResponse<CategoryDto>> create(@Valid @RequestBody CategoryRequest request) {
        CategoryDto created = categoryService.create(request);
        return ResponseEntity.ok(ApiResponse.ok("Tạo danh mục thành công", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật danh mục sản phẩm")
    public ResponseEntity<ApiResponse<CategoryDto>> update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        CategoryDto updated = categoryService.update(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật danh mục thành công", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa danh mục sản phẩm")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa danh mục thành công", null));
    }
}
