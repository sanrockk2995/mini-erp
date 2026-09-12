package com.erp.modules.warehouse.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class GoodsIssueDto {
    private Long id;
    private String ginCode;
    private Long soId;
    private String soCode;
    private Long warehouseId;
    private String warehouseCode;
    private String warehouseName;
    private LocalDate issueDate;
    private String issueType;
    private String status;
    private String notes;
    private String createdBy;
    private String confirmedBy;
    private LocalDateTime confirmedAt;
    private LocalDateTime createdAt;
    private List<GoodsIssueItemDto> items = new ArrayList<>();

    public GoodsIssueDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getGinCode() { return ginCode; }
    public void setGinCode(String ginCode) { this.ginCode = ginCode; }
    public Long getSoId() { return soId; }
    public void setSoId(Long soId) { this.soId = soId; }
    public String getSoCode() { return soCode; }
    public void setSoCode(String soCode) { this.soCode = soCode; }
    public Long getWarehouseId() { return warehouseId; }
    public void setWarehouseId(Long warehouseId) { this.warehouseId = warehouseId; }
    public String getWarehouseCode() { return warehouseCode; }
    public void setWarehouseCode(String warehouseCode) { this.warehouseCode = warehouseCode; }
    public String getWarehouseName() { return warehouseName; }
    public void setWarehouseName(String warehouseName) { this.warehouseName = warehouseName; }
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    public String getIssueType() { return issueType; }
    public void setIssueType(String issueType) { this.issueType = issueType; }
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
    public List<GoodsIssueItemDto> getItems() { return items; }
    public void setItems(List<GoodsIssueItemDto> items) { this.items = items; }
}
