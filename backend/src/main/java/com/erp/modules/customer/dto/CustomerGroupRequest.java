package com.erp.modules.customer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class CustomerGroupRequest {
    @NotBlank(message = "Mã nhóm khách hàng không được để trống")
    private String code;

    @NotBlank(message = "Tên nhóm khách hàng không được để trống")
    private String name;

    @NotNull(message = "Phần trăm chiết khấu không được để trống")
    private BigDecimal discountPercent = BigDecimal.ZERO;

    private String description;

    public CustomerGroupRequest() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public BigDecimal getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(BigDecimal discountPercent) { this.discountPercent = discountPercent; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
