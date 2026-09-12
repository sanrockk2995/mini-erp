package com.erp.modules.warehouse.entity;

import com.erp.modules.product.entity.Product;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "goods_issue_items")
public class GoodsIssueItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gin_id", nullable = false)
    private GoodsIssueNote goodsIssueNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "requested_quantity", nullable = false, precision = 12, scale = 3)
    private BigDecimal requestedQuantity;

    @Column(name = "issued_quantity", nullable = false, precision = 12, scale = 3)
    private BigDecimal issuedQuantity;

    @Column(name = "notes", length = 255)
    private String notes;

    public GoodsIssueItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public GoodsIssueNote getGoodsIssueNote() { return goodsIssueNote; }
    public void setGoodsIssueNote(GoodsIssueNote goodsIssueNote) { this.goodsIssueNote = goodsIssueNote; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public BigDecimal getRequestedQuantity() { return requestedQuantity; }
    public void setRequestedQuantity(BigDecimal requestedQuantity) { this.requestedQuantity = requestedQuantity; }
    public BigDecimal getIssuedQuantity() { return issuedQuantity; }
    public void setIssuedQuantity(BigDecimal issuedQuantity) { this.issuedQuantity = issuedQuantity; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
