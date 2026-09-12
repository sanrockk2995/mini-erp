package com.erp.modules.product.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "product_attributes")
public class ProductAttribute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "attr_key", nullable = false, length = 50)
    private String attrKey;

    @Column(name = "attr_value", nullable = false, length = 255)
    private String attrValue;

    public ProductAttribute() {}

    public ProductAttribute(Product product, String attrKey, String attrValue) {
        this.product = product;
        this.attrKey = attrKey;
        this.attrValue = attrValue;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public String getAttrKey() { return attrKey; }
    public void setAttrKey(String attrKey) { this.attrKey = attrKey; }
    public String getAttrValue() { return attrValue; }
    public void setAttrValue(String attrValue) { this.attrValue = attrValue; }
}
