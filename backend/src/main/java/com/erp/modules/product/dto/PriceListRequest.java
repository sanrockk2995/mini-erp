package com.erp.modules.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class PriceListRequest {
    @NotBlank(message = "Mã bảng giá không được để trống")
    private String code;

    @NotBlank(message = "Tên bảng giá không được để trống")
    private String name;

    private Long customerGroupId;

    @NotNull(message = "Ngày bắt đầu hiệu lực không được để trống")
    private LocalDate startDate;

    private LocalDate endDate;
    private Boolean isActive = true;
    private List<PriceListItemRequest> items = new ArrayList<>();

    public PriceListRequest() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getCustomerGroupId() { return customerGroupId; }
    public void setCustomerGroupId(Long customerGroupId) { this.customerGroupId = customerGroupId; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public List<PriceListItemRequest> getItems() { return items; }
    public void setItems(List<PriceListItemRequest> items) { this.items = items; }

    public static class PriceListItemRequest {
        @NotNull(message = "ID sản phẩm không được để trống")
        private Long productId;

        @NotNull(message = "Đơn giá không được để trống")
        private BigDecimal unitPrice;

        public PriceListItemRequest() {}

        public PriceListItemRequest(Long productId, BigDecimal unitPrice) {
            this.productId = productId;
            this.unitPrice = unitPrice;
        }

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    }
}
