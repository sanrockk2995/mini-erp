package com.erp.modules.warehouse.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class StockAdjustmentRequest {
    @NotNull(message = "Kho không được để trống")
    private Long warehouseId;

    @NotNull(message = "Sản phẩm không được để trống")
    private Long productId;

    @NotNull(message = "Loại biến động không được để trống (IN/OUT)")
    private String transactionType; // IN, OUT

    @NotNull(message = "Số lượng không được để trống")
    private BigDecimal quantity;

    private String notes;

    public StockAdjustmentRequest() {}

    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
