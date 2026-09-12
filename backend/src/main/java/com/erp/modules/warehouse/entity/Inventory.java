package com.erp.modules.warehouse.entity;

import com.erp.common.BaseEntity;
import com.erp.modules.product.entity.Product;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "inventory")
public class Inventory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "quantity_on_hand", nullable = false, precision = 12, scale = 3)
    private BigDecimal quantityOnHand = BigDecimal.ZERO;

    @Column(name = "quantity_reserved", nullable = false, precision = 12, scale = 3)
    private BigDecimal quantityReserved = BigDecimal.ZERO;

    @Column(name = "quantity_available", nullable = false, precision = 12, scale = 3)
    private BigDecimal quantityAvailable = BigDecimal.ZERO;

    public Inventory() {}

    public Inventory(Warehouse warehouse, Product product, BigDecimal quantityOnHand, BigDecimal quantityReserved, BigDecimal quantityAvailable) {
        this.warehouse = warehouse;
        this.product = product;
        this.quantityOnHand = quantityOnHand;
        this.quantityReserved = quantityReserved;
        this.quantityAvailable = quantityAvailable;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public BigDecimal getQuantityOnHand() { return quantityOnHand; }
    public void setQuantityOnHand(BigDecimal quantityOnHand) { this.quantityOnHand = quantityOnHand; }
    public BigDecimal getQuantityReserved() { return quantityReserved; }
    public void setQuantityReserved(BigDecimal quantityReserved) { this.quantityReserved = quantityReserved; }
    public BigDecimal getQuantityAvailable() { return quantityAvailable; }
    public void setQuantityAvailable(BigDecimal quantityAvailable) { this.quantityAvailable = quantityAvailable; }
}
