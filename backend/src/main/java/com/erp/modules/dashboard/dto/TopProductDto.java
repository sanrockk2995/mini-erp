package com.erp.modules.dashboard.dto;

import java.math.BigDecimal;

public class TopProductDto {
    private Long productId;
    private String productSku;
    private String productName;
    private BigDecimal totalQuantitySold;
    private BigDecimal totalRevenue;

    public TopProductDto() {}

    public TopProductDto(Long productId, String productSku, String productName, BigDecimal totalQuantitySold, BigDecimal totalRevenue) {
        this.productId = productId;
        this.productSku = productSku;
        this.productName = productName;
        this.totalQuantitySold = totalQuantitySold;
        this.totalRevenue = totalRevenue;
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getProductSku() { return productSku; }
    public void setProductSku(String productSku) { this.productSku = productSku; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public BigDecimal getTotalQuantitySold() { return totalQuantitySold; }
    public void setTotalQuantitySold(BigDecimal totalQuantitySold) { this.totalQuantitySold = totalQuantitySold; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
}
