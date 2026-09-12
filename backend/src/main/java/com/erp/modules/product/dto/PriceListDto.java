package com.erp.modules.product.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class PriceListDto {
    private Long id;
    private String code;
    private String name;
    private Long customerGroupId;
    private String customerGroupName;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isActive;
    private List<PriceListItemDto> items = new ArrayList<>();

    public PriceListDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getCustomerGroupId() { return customerGroupId; }
    public void setCustomerGroupId(Long customerGroupId) { this.customerGroupId = customerGroupId; }
    public String getCustomerGroupName() { return customerGroupName; }
    public void setCustomerGroupName(String customerGroupName) { this.customerGroupName = customerGroupName; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public List<PriceListItemDto> getItems() { return items; }
    public void setItems(List<PriceListItemDto> items) { this.items = items; }

    public static class PriceListItemDto {
        private Long id;
        private Long productId;
        private String productSku;
        private String productName;
        private BigDecimal unitPrice;

        public PriceListItemDto() {}

        public PriceListItemDto(Long id, Long productId, String productSku, String productName, BigDecimal unitPrice) {
            this.id = id;
            this.productId = productId;
            this.productSku = productSku;
            this.productName = productName;
            this.unitPrice = unitPrice;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public String getProductSku() { return productSku; }
        public void setProductSku(String productSku) { this.productSku = productSku; }
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    }
}
