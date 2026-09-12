package com.erp.modules.supplier.dto;

import jakarta.validation.constraints.NotBlank;

public class SupplierRequest {

    @NotBlank(message = "Mã nhà cung cấp không được để trống")
    private String code;

    @NotBlank(message = "Tên nhà cung cấp không được để trống")
    private String name;

    private String phone;
    private String email;
    private String address;
    private String taxCode;
    private String productGroups;
    private Boolean isActive = true;

    public SupplierRequest() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getTaxCode() { return taxCode; }
    public void setTaxCode(String taxCode) { this.taxCode = taxCode; }
    public String getProductGroups() { return productGroups; }
    public void setProductGroups(String productGroups) { this.productGroups = productGroups; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
