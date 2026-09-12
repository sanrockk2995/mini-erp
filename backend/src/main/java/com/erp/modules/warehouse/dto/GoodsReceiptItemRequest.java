package com.erp.modules.warehouse.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class GoodsReceiptItemRequest {

    @NotNull(message = "Sản phẩm không được để trống")
    private Long productId;

    private BigDecimal orderedQuantity = BigDecimal.ZERO;

    @NotNull(message = "Số lượng thực nhận không được để trống")
    @DecimalMin(value = "0.001", message = "Số lượng thực nhận phải lớn hơn 0")
    private BigDecimal receivedQuantity;

    private BigDecimal unitPrice = BigDecimal.ZERO;

    private String notes;

    public GoodsReceiptItemRequest() {}

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public BigDecimal getOrderedQuantity() { return orderedQuantity; }
    public void setOrderedQuantity(BigDecimal orderedQuantity) { this.orderedQuantity = orderedQuantity; }
    public BigDecimal getReceivedQuantity() { return receivedQuantity; }
    public void setReceivedQuantity(BigDecimal receivedQuantity) { this.receivedQuantity = receivedQuantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
