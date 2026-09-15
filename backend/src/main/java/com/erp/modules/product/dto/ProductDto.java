package com.erp.modules.product.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

public class ProductDto {
    private Long id;
    private String sku;
    private String barcode;
    private String name;
    private Long categoryId;
    private String categoryName;
    private String unit;
    private String color;
    private String size;
    private String material;
    private BigDecimal standardCost;
    private BigDecimal standardPrice;
    private BigDecimal wholesalePrice;
    private String description;
    private Boolean isActive;
    private Map<String, String> attributes = new HashMap<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProductDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public String getColor() { return color; }
    public void setColor(String color) {
        this.color = color;
        if (color != null) this.attributes.put("color", color);
    }
    public String getSize() { return size; }
    public void setSize(String size) {
        this.size = size;
        if (size != null) this.attributes.put("size", size);
    }
    public String getMaterial() { return material; }
    public void setMaterial(String material) {
        this.material = material;
        if (material != null) this.attributes.put("material", material);
    }
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
    public Map<String, String> getAttributes() {
        if (attributes == null) attributes = new HashMap<>();
        if (color != null) attributes.put("color", color);
        if (size != null) attributes.put("size", size);
        if (material != null) attributes.put("material", material);
        return attributes;
    }
    public void setAttributes(Map<String, String> attributes) {
        this.attributes = attributes != null ? attributes : new HashMap<>();
        if (this.attributes.containsKey("color")) this.color = this.attributes.get("color");
        if (this.attributes.containsKey("size")) this.size = this.attributes.get("size");
        if (this.attributes.containsKey("material")) this.material = this.attributes.get("material");
    }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
