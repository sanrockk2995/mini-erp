package com.erp.modules.warehouse.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class GoodsReceiptRequest {

    private Long poId;

    @NotNull(message = "Kho nhập không được để trống")
    private Long warehouseId;

    private LocalDate receiptDate;

    private String notes;

    @NotEmpty(message = "Phiếu nhập kho phải có ít nhất 1 sản phẩm")
    @Valid
    private List<GoodsReceiptItemRequest> items;

    public GoodsReceiptRequest() {}

    public Long getPoId() { return poId; }
    public void setPoId(Long poId) { this.poId = poId; }
    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }
    public LocalDate getReceiptDate() { return receiptDate; }
    public void setReceiptDate(LocalDate receiptDate) { this.receiptDate = receiptDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public List<GoodsReceiptItemRequest> getItems() { return items; }
    public void setItems(List<GoodsReceiptItemRequest> items) { this.items = items; }
}
