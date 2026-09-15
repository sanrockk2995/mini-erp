package com.erp.modules.purchase.entity;

import com.erp.common.BaseEntity;
import com.erp.modules.supplier.entity.Supplier;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "supplier_debts")
public class SupplierDebt extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "po_id")
    private PurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(name = "invoice_code", unique = true, nullable = false, length = 50)
    private String invoiceCode;

    @Column(name = "debt_date", nullable = false)
    private LocalDate debtDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "paid_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(name = "remaining_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal remainingAmount = BigDecimal.ZERO;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "UNPAID"; // UNPAID, PARTIAL, PAID

    @Column(name = "payment_method", length = 30)
    private String paymentMethod = "BANK_TRANSFER";

    @Column(name = "payment_reference", length = 100)
    private String paymentReference;

    @Column(name = "last_payment_date")
    private LocalDate lastPaymentDate;

    @Column(name = "payment_notes", length = 255)
    private String paymentNotes;

    @Column(name = "paid_by", length = 50)
    private String paidBy;

    public SupplierDebt() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public PurchaseOrder getPurchaseOrder() { return purchaseOrder; }
    public void setPurchaseOrder(PurchaseOrder purchaseOrder) { this.purchaseOrder = purchaseOrder; }
    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }
    public String getInvoiceCode() { return invoiceCode; }
    public void setInvoiceCode(String invoiceCode) { this.invoiceCode = invoiceCode; }
    public LocalDate getDebtDate() { return debtDate; }
    public void setDebtDate(LocalDate debtDate) { this.debtDate = debtDate; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getPaidAmount() { return paidAmount; }
    public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }
    public BigDecimal getRemainingAmount() { return remainingAmount; }
    public void setRemainingAmount(BigDecimal remainingAmount) { this.remainingAmount = remainingAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }
    public LocalDate getLastPaymentDate() { return lastPaymentDate; }
    public void setLastPaymentDate(LocalDate lastPaymentDate) { this.lastPaymentDate = lastPaymentDate; }
    public String getPaymentNotes() { return paymentNotes; }
    public void setPaymentNotes(String paymentNotes) { this.paymentNotes = paymentNotes; }
    public String getPaidBy() { return paidBy; }
    public void setPaidBy(String paidBy) { this.paidBy = paidBy; }
}
