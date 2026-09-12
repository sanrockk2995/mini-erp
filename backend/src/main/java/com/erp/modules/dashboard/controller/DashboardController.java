package com.erp.modules.dashboard.controller;

import com.erp.common.ApiResponse;
import com.erp.modules.dashboard.dto.DashboardStatsDto;
import com.erp.modules.dashboard.dto.MonthlySalesDto;
import com.erp.modules.dashboard.dto.TopProductDto;
import com.erp.modules.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard Management", description = "Chỉ số tổng quan doanh nghiệp, xu hướng doanh số và cảnh báo kho")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    @Operation(summary = "Lấy các chỉ số KPI thống kê tổng quan (Doanh thu tháng, Đơn hàng, Tồn kho thấp, Công nợ)")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getStats()));
    }

    @GetMapping("/sales-trend")
    @Operation(summary = "Lấy dữ liệu biểu đồ xu hướng doanh thu theo các tháng gần nhất")
    public ResponseEntity<ApiResponse<List<MonthlySalesDto>>> getSalesTrend() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getSalesTrend()));
    }

    @GetMapping("/top-products")
    @Operation(summary = "Top 5 sản phẩm bán chạy nhất theo doanh thu")
    public ResponseEntity<ApiResponse<List<TopProductDto>>> getTopProducts() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getTopProducts()));
    }
}
