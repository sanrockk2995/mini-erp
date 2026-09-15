package com.erp.modules.customer.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CustomerDto {
    private Long id;
    private String code;
    private String name;
    private String customerType;
    private String phone;
    private String email;
    private String address;
    private String taxCode;
    private Long groupId;
    private String groupName;
    private BigDecimal discountPercent = BigDecimal.ZERO;
    private BigDecimal groupDiscountPercent = BigDecimal.ZERO;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public CustomerDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCustomerType() { return customerType; }
    public void setCustomerType(String customerType) { this.customerType = customerType; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getTaxCode() { return taxCode; }
    public void setTaxCode(String taxCode) { this.taxCode = taxCode; }
    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }
    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }
    public BigDecimal getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(BigDecimal discountPercent) {
        this.discountPercent = discountPercent;
        this.groupDiscountPercent = discountPercent;
    }
    public BigDecimal getGroupDiscountPercent() { return groupDiscountPercent; }
    public void setGroupDiscountPercent(BigDecimal groupDiscountPercent) {
        this.groupDiscountPercent = groupDiscountPercent;
        this.discountPercent = groupDiscountPercent;
    }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
