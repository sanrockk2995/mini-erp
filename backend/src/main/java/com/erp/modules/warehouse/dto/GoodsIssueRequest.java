package com.erp.modules.warehouse.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class GoodsIssueRequest {

    private Long soId;

    @NotNull(message = "Kho xuất không được để trống")
    private Long warehouseId;

    private LocalDate issueDate;

    private String issueType = "SALES_ORDER"; // SALES_ORDER, TRANSFER, DISPOSAL

    private String notes;

    @NotEmpty(message = "Phiếu xuất kho phải có ít nhất 1 sản phẩm")
    @Valid
    private List<GoodsIssueItemRequest> items;

    public GoodsIssueRequest() {}

    public Long getSoId() { return soId; }
    public void setSoId(Long soId) { this.soId = soId; }
    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    public String getIssueType() { return issueType; }
    public void setIssueType(String issueType) { this.issueType = issueType; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public List<GoodsIssueItemRequest> getItems() { return items; }
    public void setItems(List<GoodsIssueItemRequest> items) { this.items = items; }
}
