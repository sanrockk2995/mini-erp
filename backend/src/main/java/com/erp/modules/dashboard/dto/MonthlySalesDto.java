package com.erp.modules.dashboard.dto;

import java.math.BigDecimal;

public class MonthlySalesDto {
    private String month; // e.g. "2026-01", "2026-02"
    private BigDecimal revenue;
    private long orderCount;

    public MonthlySalesDto() {}

    public MonthlySalesDto(String month, BigDecimal revenue, long orderCount) {
        this.month = month;
        this.revenue = revenue;
        this.orderCount = orderCount;
    }

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }
    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
    public long getOrderCount() { return orderCount; }
    public void setOrderCount(long orderCount) { this.orderCount = orderCount; }
}
