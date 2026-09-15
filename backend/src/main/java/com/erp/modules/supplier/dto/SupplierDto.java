package com.erp.modules.supplier.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
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
    private BigDecimal qualityScore;
    private BigDecimal deliveryScore;
    private BigDecimal priceScore;
    private BigDecimal ratingScore;
    private String ratingTier;
    private LocalDate reviewDate;
    private String reviewNotes;
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
    public BigDecimal getQualityScore() { return qualityScore; }
    public void setQualityScore(BigDecimal qualityScore) { this.qualityScore = qualityScore; }
    public BigDecimal getDeliveryScore() { return deliveryScore; }
    public void setDeliveryScore(BigDecimal deliveryScore) { this.deliveryScore = deliveryScore; }
    public BigDecimal getPriceScore() { return priceScore; }
    public void setPriceScore(BigDecimal priceScore) { this.priceScore = priceScore; }
    public BigDecimal getRatingScore() { return ratingScore; }
    public void setRatingScore(BigDecimal ratingScore) { this.ratingScore = ratingScore; }
    public String getRatingTier() { return ratingTier; }
    public void setRatingTier(String ratingTier) { this.ratingTier = ratingTier; }
    public LocalDate getReviewDate() { return reviewDate; }
    public void setReviewDate(LocalDate reviewDate) { this.reviewDate = reviewDate; }
    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public BigDecimal getCurrentDebt() { return currentDebt; }
    public void setCurrentDebt(BigDecimal currentDebt) { this.currentDebt = currentDebt; }
}
