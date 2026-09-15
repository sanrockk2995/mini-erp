package com.erp.modules.product.entity;

import com.erp.common.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
public class Product extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @Column(length = 100)
    private String barcode;

    @Column(nullable = false, length = 200)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "category_name", length = 100)
    private String categoryName;

    @Column(nullable = false, length = 20)
    private String unit = "Cái";

    @Column(length = 50)
    private String color;

    @Column(length = 50)
    private String size;

    @Column(length = 100)
    private String material;

    @Column(name = "standard_cost", nullable = false, precision = 15, scale = 2)
    private BigDecimal standardCost = BigDecimal.ZERO;

    @Column(name = "standard_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal standardPrice = BigDecimal.ZERO;

    @Column(name = "wholesale_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal wholesalePrice = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    public Product() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) {
        this.category = category;
        if (category != null) {
            this.categoryName = category.getName();
        }
    }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    public String getMaterial() { return material; }
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
}
