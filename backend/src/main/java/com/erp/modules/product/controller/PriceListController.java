package com.erp.modules.product.controller;

import com.erp.common.ApiResponse;
import com.erp.modules.product.dto.PriceListDto;
import com.erp.modules.product.dto.PriceListRequest;
import com.erp.modules.product.service.PriceListService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/price-lists")
@Tag(name = "Price Lists", description = "Quản lý Bảng giá theo Nhóm Khách hàng và Thời gian")
public class PriceListController {

    private final PriceListService priceListService;

    public PriceListController(PriceListService priceListService) {
        this.priceListService = priceListService;
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả các bảng giá")
    public ResponseEntity<ApiResponse<List<PriceListDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(priceListService.getAll()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết bảng giá kèm danh sách giá sản phẩm")
    public ResponseEntity<ApiResponse<PriceListDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(priceListService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Tạo mới bảng giá")
    public ResponseEntity<ApiResponse<PriceListDto>> create(@Valid @RequestBody PriceListRequest request) {
        PriceListDto created = priceListService.create(request);
        return ResponseEntity.ok(ApiResponse.ok("Tạo bảng giá thành công", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật bảng giá")
    public ResponseEntity<ApiResponse<PriceListDto>> update(@PathVariable Long id, @Valid @RequestBody PriceListRequest request) {
        PriceListDto updated = priceListService.update(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật bảng giá thành công", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa bảng giá")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        priceListService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa bảng giá thành công", null));
    }

    @GetMapping("/effective-price")
    @Operation(summary = "Tra cứu giá bán hiệu lực của sản phẩm cho nhóm khách hàng tại một thời điểm")
    public ResponseEntity<ApiResponse<BigDecimal>> getEffectivePrice(
            @RequestParam Long productId,
            @RequestParam(required = false) Long customerGroupId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        BigDecimal price = priceListService.getEffectiveProductPrice(productId, customerGroupId, queryDate);
        return ResponseEntity.ok(ApiResponse.ok(price));
    }
}
