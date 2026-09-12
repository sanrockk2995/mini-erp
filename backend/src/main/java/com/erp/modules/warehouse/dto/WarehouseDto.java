package com.erp.modules.warehouse.dto;

public class WarehouseDto {
    private Long id;
    private String code;
    private String name;
    private String address;
    private String managerName;
    private String phone;
    private Boolean isActive;

    public WarehouseDto() {}

    public WarehouseDto(Long id, String code, String name, String address, String managerName, String phone, Boolean isActive) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.address = address;
        this.managerName = managerName;
        this.phone = phone;
        this.isActive = isActive;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
