package com.erp.modules.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class ProductRequest {
    @NotBlank(message = "SKU không được để trống")
    private String sku;

    private String barcode;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    private Long categoryId;

    @NotBlank(message = "Đơn vị tính không được để trống")
    private String unit = "Cái";

    private String color;
    private String size;
    private String material;

    @NotNull(message = "Giá vốn tiêu chuẩn không được để trống")
    private BigDecimal standardCost = BigDecimal.ZERO;

    @NotNull(message = "Giá bán tiêu chuẩn không được để trống")
    private BigDecimal standardPrice = BigDecimal.ZERO;

    private BigDecimal wholesalePrice = BigDecimal.ZERO;

    private String description;
    private Boolean isActive = true;
    private Map<String, String> attributes = new HashMap<>();

    public ProductRequest() {}

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public String getColor() {
        if (color == null && attributes != null) return attributes.get("color");
        return color;
    }
    public void setColor(String color) { this.color = color; }
    public String getSize() {
        if (size == null && attributes != null) return attributes.get("size");
        return size;
    }
    public void setSize(String size) { this.size = size; }
    public String getMaterial() {
        if (material == null && attributes != null) return attributes.get("material");
        return material;
    }
    public void setMaterial(String material) { this.material = material; }
    public BigDecimal getStandardCost() { return standardCost; }
    public void setStandardCost(BigDecimal standardCost) { this.standardCost = standardCost; }
    public BigDecimal getStandardPrice() { return standardPrice; }
    public void setStandardPrice(BigDecimal standardPrice) { this.standardPrice = standardPrice; }
    public BigDecimal getWholesalePrice() { return wholesalePrice; }
    public void setWholesalePrice(BigDecimal wholesalePrice) { this.wholesalePrice = wholesalePrice; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public Map<String, String> getAttributes() { return attributes; }
    public void setAttributes(Map<String, String> attributes) {
        this.attributes = attributes != null ? attributes : new HashMap<>();
        if (this.attributes.containsKey("color")) this.color = this.attributes.get("color");
        if (this.attributes.containsKey("size")) this.size = this.attributes.get("size");
        if (this.attributes.containsKey("material")) this.material = this.attributes.get("material");
    }
}
