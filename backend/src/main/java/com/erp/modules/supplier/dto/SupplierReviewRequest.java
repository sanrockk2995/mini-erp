package com.erp.modules.supplier.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class SupplierReviewRequest {

    private LocalDate reviewDate;

    @NotNull(message = "Điểm chất lượng không được để trống")
    @DecimalMin(value = "1.0", message = "Điểm tối thiểu là 1.0")
    @DecimalMax(value = "10.0", message = "Điểm tối đa là 10.0")
    private BigDecimal qualityScore;

    @NotNull(message = "Điểm tiến độ giao hàng không được để trống")
    @DecimalMin(value = "1.0", message = "Điểm tối thiểu là 1.0")
    @DecimalMax(value = "10.0", message = "Điểm tối đa là 10.0")
    private BigDecimal deliveryScore;

    @NotNull(message = "Điểm giá cả không được để trống")
    @DecimalMin(value = "1.0", message = "Điểm tối thiểu là 1.0")
    @DecimalMax(value = "10.0", message = "Điểm tối đa là 10.0")
    private BigDecimal priceScore;

    private String comments;

    public SupplierReviewRequest() {}

    public LocalDate getReviewDate() { return reviewDate; }
    public void setReviewDate(LocalDate reviewDate) { this.reviewDate = reviewDate; }
    public BigDecimal getQualityScore() { return qualityScore; }
    public void setQualityScore(BigDecimal qualityScore) { this.qualityScore = qualityScore; }
    public BigDecimal getDeliveryScore() { return deliveryScore; }
    public void setDeliveryScore(BigDecimal deliveryScore) { this.deliveryScore = deliveryScore; }
    public BigDecimal getPriceScore() { return priceScore; }
    public void setPriceScore(BigDecimal priceScore) { this.priceScore = priceScore; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}
