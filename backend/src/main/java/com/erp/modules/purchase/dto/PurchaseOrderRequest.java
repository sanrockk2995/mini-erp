package com.erp.modules.purchase.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class PurchaseOrderRequest {

    @NotNull(message = "Nhà cung cấp không được để trống")
    private Long supplierId;

    @NotNull(message = "Kho nhập không được để trống")
    private Long warehouseId;

    private LocalDate orderDate;
    private LocalDate expectedDate;
    private BigDecimal taxAmount = BigDecimal.ZERO;
    private String notes;

    @NotEmpty(message = "Đơn mua phải có ít nhất 1 sản phẩm")
    @Valid
    private List<PurchaseOrderItemRequest> items;

    public PurchaseOrderRequest() {}

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }
    public LocalDate getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDate orderDate) { this.orderDate = orderDate; }
    public LocalDate getExpectedDate() { return expectedDate; }
    public void setExpectedDate(LocalDate expectedDate) { this.expectedDate = expectedDate; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public List<PurchaseOrderItemRequest> getItems() { return items; }
    public void setItems(List<PurchaseOrderItemRequest> items) { this.items = items; }
}
