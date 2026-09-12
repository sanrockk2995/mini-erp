package com.erp.modules.warehouse.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class GoodsReceiptDto {
    private Long id;
    private String grnCode;
    private Long poId;
    private String poCode;
    private Long warehouseId;
    private String warehouseCode;
    private String warehouseName;
    private LocalDate receiptDate;
    private String status;
    private String notes;
    private String createdBy;
    private String confirmedBy;
    private LocalDateTime confirmedAt;
    private LocalDateTime createdAt;
    private List<GoodsReceiptItemDto> items = new ArrayList<>();

    public GoodsReceiptDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getGrnCode() { return grnCode; }
    public void setGrnCode(String grnCode) { this.grnCode = grnCode; }
    public Long getPoId() { return poId; }
    public void setPoId(Long poId) { this.poId = poId; }
    public String getPoCode() { return poCode; }
    public void setPoCode(String poCode) { this.poCode = poCode; }
    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }
    public String getWarehouseCode() { return warehouseCode; }
    public void setWarehouseCode(String warehouseCode) { this.warehouseCode = warehouseCode; }
    public String getWarehouseName() { return warehouseName; }
    public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }
    public LocalDate getReceiptDate() { return receiptDate; }
    public void setReceiptDate(LocalDate receiptDate) { this.receiptDate = receiptDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getConfirmedBy() { return confirmedBy; }
    public void setConfirmedBy(String confirmedBy) { this.confirmedBy = confirmedBy; }
    public LocalDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(LocalDateTime confirmedAt) { this.confirmedAt = confirmedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<GoodsReceiptItemDto> getItems() { return items; }
    public void setItems(List<GoodsReceiptItemDto> items) { this.items = items; }
}
