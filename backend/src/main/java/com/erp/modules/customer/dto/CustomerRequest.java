package com.erp.modules.customer.dto;

import jakarta.validation.constraints.NotBlank;

public class CustomerRequest {
    @NotBlank(message = "Mã khách hàng không được để trống")
    private String code;

    @NotBlank(message = "Tên khách hàng không được để trống")
    private String name;

    private String customerType = "INDIVIDUAL"; // INDIVIDUAL, BUSINESS
    private String phone;
    private String email;
    private String address;
    private String taxCode;
    private Long groupId;
    private Boolean isActive = true;

    public CustomerRequest() {}

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCustomerType() { return customerType; }
    public void setCustomerType(String customerType) { this.customerType = customerType; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getTaxCode() { return taxCode; }
    public void setTaxCode(String taxCode) { this.taxCode = taxCode; }
    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
