package com.erp.modules.sales.dto;

import java.time.LocalDateTime;

public class SalesOrderStatusHistoryDto {
    private Long id;
    private String fromStatus;
    private String toStatus;
    private String note;
    private String changedBy;
    private LocalDateTime changedAt;

    public SalesOrderStatusHistoryDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFromStatus() { return fromStatus; }
    public void setFromStatus(String fromStatus) { this.fromStatus = fromStatus; }
    public String getToStatus() { return toStatus; }
    public void setToStatus(String toStatus) { this.toStatus = toStatus; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getChangedBy() { return changedBy; }
    public void setChangedBy(String changedBy) { this.changedBy = changedBy; }
    public LocalDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }
}
