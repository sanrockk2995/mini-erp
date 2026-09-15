package com.erp.modules.supplier.entity;

import com.erp.common.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "suppliers")
public class Supplier extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", unique = true, nullable = false, length = 50)
    private String code;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "tax_code", length = 50)
    private String taxCode;

    @Column(name = "product_groups", length = 255)
    private String productGroups;

    @Column(name = "quality_score", nullable = false, precision = 3, scale = 1)
    private BigDecimal qualityScore = BigDecimal.ZERO;

    @Column(name = "delivery_score", nullable = false, precision = 3, scale = 1)
    private BigDecimal deliveryScore = BigDecimal.ZERO;

    @Column(name = "price_score", nullable = false, precision = 3, scale = 1)
    private BigDecimal priceScore = BigDecimal.ZERO;

    @Column(name = "rating_score", nullable = false, precision = 3, scale = 1)
    private BigDecimal ratingScore = BigDecimal.ZERO;

    @Column(name = "rating_tier", nullable = false, length = 10)
    private String ratingTier = "B"; // A, B, C

    @Column(name = "review_date")
    private LocalDate reviewDate;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    public Supplier() {}

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
}
