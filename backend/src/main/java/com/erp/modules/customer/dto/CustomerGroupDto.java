package com.erp.modules.customer.dto;

import java.math.BigDecimal;

public class CustomerGroupDto {
    private Long id;
    private String code;
    private String name;
    private BigDecimal discountPercent;
    private String description;

    public CustomerGroupDto() {}

    public CustomerGroupDto(Long id, String code, String name, BigDecimal discountPercent, String description) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.discountPercent = discountPercent;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public BigDecimal getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(BigDecimal discountPercent) { this.discountPercent = discountPercent; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
