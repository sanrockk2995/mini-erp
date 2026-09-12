package com.erp.modules.warehouse.entity;

import com.erp.common.BaseEntity;
import com.erp.modules.sales.entity.SalesOrder;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "goods_issue_notes")
public class GoodsIssueNote extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "gin_code", unique = true, nullable = false, length = 50)
    private String ginCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "so_id")
    private SalesOrder salesOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "issue_type", nullable = false, length = 30)
    private String issueType = "SALES_ORDER"; // SALES_ORDER, TRANSFER, DISPOSAL

    @Column(name = "status", nullable = false, length = 20)
    private String status = "DRAFT"; // DRAFT, CONFIRMED, CANCELLED

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_by", nullable = false, length = 50)
    private String createdBy;

    @Column(name = "confirmed_by", length = 50)
    private String confirmedBy;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @OneToMany(mappedBy = "goodsIssueNote", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GoodsIssueItem> items = new ArrayList<>();

    public GoodsIssueNote() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getGinCode() { return ginCode; }
    public void setGinCode(String ginCode) { this.ginCode = ginCode; }
    public SalesOrder getSalesOrder() { return salesOrder; }
    public void setSalesOrder(SalesOrder salesOrder) { this.salesOrder = salesOrder; }
    public Warehouse getWarehouse() { return warehouse; }
    public void setWarehouse(Warehouse warehouse) { this.warehouse = warehouse; }
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    public String getIssueType() { return issueType; }
    public void setIssueType(String issueType) { this.issueType = issueType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getConfirmedBy() { return confirmedBy; }
    public void setConfirmedBy(String confirmedBy) { this.confirmedBy = confirmedBy; }
    public LocalDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(LocalDateTime confirmedAt) { this.confirmedAt = confirmedAt; }
    public List<GoodsIssueItem> getItems() { return items; }
    public void setItems(List<GoodsIssueItem> items) { this.items = items; }

    public void addItem(GoodsIssueItem item) {
        items.add(item);
        item.setGoodsIssueNote(this);
    }
}
