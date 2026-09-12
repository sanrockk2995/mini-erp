package com.erp.modules.warehouse.dto;

import jakarta.validation.constraints.NotBlank;

public class WarehouseRequest {
    @NotBlank(message = "Mã kho không được để trống")
    private String code;

    @NotBlank(message = "Tên kho không được để trống")
    private String name;

    private String address;
    private String managerName;
    private String phone;
    private Boolean isActive = true;

    public WarehouseRequest() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getManagerName() { return managerName; }
    public void setManagerName(String managerName) { this.managerName = managerName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
