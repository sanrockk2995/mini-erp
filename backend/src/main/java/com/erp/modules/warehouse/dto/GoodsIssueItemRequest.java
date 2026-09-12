package com.erp.modules.warehouse.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class GoodsIssueItemRequest {

    @NotNull(message = "Sản phẩm không được để trống")
    private Long productId;

    private BigDecimal requestedQuantity = BigDecimal.ZERO;

    @NotNull(message = "Số lượng thực xuất không được để trống")
    @DecimalMin(value = "0.001", message = "Số lượng thực xuất phải lớn hơn 0")
    private BigDecimal issuedQuantity;

    private String notes;

    public GoodsIssueItemRequest() {}

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public BigDecimal getRequestedQuantity() { return requestedQuantity; }
    public void setRequestedQuantity(BigDecimal requestedQuantity) { this.requestedQuantity = requestedQuantity; }
    public BigDecimal getIssuedQuantity() { return issuedQuantity; }
    public void setIssuedQuantity(BigDecimal issuedQuantity) { this.issuedQuantity = issuedQuantity; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
