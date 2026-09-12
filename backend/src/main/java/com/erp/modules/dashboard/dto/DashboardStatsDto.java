package com.erp.modules.dashboard.dto;

import java.math.BigDecimal;

public class DashboardStatsDto {
    private BigDecimal totalMonthlyRevenue;
    private long totalOrdersThisMonth;
    private long pendingOrdersCount;
    private long lowStockCount;
    private BigDecimal totalSupplierDebt;
    private long totalProductsCount;
    private long totalCustomersCount;
    private long totalSuppliersCount;

    public DashboardStatsDto() {}

    public BigDecimal getTotalMonthlyRevenue() { return totalMonthlyRevenue; }
    public void setTotalMonthlyRevenue(BigDecimal totalMonthlyRevenue) { this.totalMonthlyRevenue = totalMonthlyRevenue; }
    public long getTotalOrdersThisMonth() { return totalOrdersThisMonth; }
    public void setTotalOrdersThisMonth(long totalOrdersThisMonth) { this.totalOrdersThisMonth = totalOrdersThisMonth; }
    public long getPendingOrdersCount() { return pendingOrdersCount; }
    public void setPendingOrdersCount(long pendingOrdersCount) { this.pendingOrdersCount = pendingOrdersCount; }
    public long getLowStockCount() { return lowStockCount; }
    public void setLowStockCount(long lowStockCount) { this.lowStockCount = lowStockCount; }
    public BigDecimal getTotalSupplierDebt() { return totalSupplierDebt; }
    public void setTotalSupplierDebt(BigDecimal totalSupplierDebt) { this.totalSupplierDebt = totalSupplierDebt; }
    public long getTotalProductsCount() { return totalProductsCount; }
    public void setTotalProductsCount(long totalProductsCount) { this.totalProductsCount = totalProductsCount; }
    public long getTotalCustomersCount() { return totalCustomersCount; }
    public void setTotalCustomersCount(long totalCustomersCount) { this.totalCustomersCount = totalCustomersCount; }
    public long getTotalSuppliersCount() { return totalSuppliersCount; }
    public void setTotalSuppliersCount(long totalSuppliersCount) { this.totalSuppliersCount = totalSuppliersCount; }
}
