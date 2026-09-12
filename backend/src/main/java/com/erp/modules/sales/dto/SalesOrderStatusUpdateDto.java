package com.erp.modules.sales.dto;

import jakarta.validation.constraints.NotBlank;

public class SalesOrderStatusUpdateDto {

    @NotBlank(message = "Trạng thái mới không được để trống")
    private String status;

    private String note;

    public SalesOrderStatusUpdateDto() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
