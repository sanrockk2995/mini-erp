package com.erp.modules.supplier.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SupplierDto {
    private Long id;
    private String code;
    private String name;
    private String phone;
    private String email;
    private String address;
    private String taxCode;
    private String productGroups;
    private BigDecimal ratingScore;
    private String ratingTier;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private BigDecimal currentDebt;

    public SupplierDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getTaxCode() { return taxCode; }
    public void setTaxCode(String taxCode) { this.taxCode = taxCode; }
    public String getProductGroups() { return productGroups; }
    public void setProductGroups(String productGroups) { this.productGroups = productGroups; }
    public BigDecimal getRatingScore() { return ratingScore; }
    public void setRatingScore(BigDecimal ratingScore) { this.ratingScore = ratingScore; }
    public String getRatingTier() { return ratingTier; }
    public void setRatingTier(String ratingTier) { this.ratingTier = ratingTier; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public BigDecimal getCurrentDebt() { return currentDebt; }
    public void setCurrentDebt(BigDecimal currentDebt) { this.currentDebt = currentDebt; }
}
