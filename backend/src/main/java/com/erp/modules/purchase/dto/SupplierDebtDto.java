package com.erp.modules.purchase.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class SupplierDebtDto {
    private Long id;
    private Long poId;
    private String poCode;
    private Long supplierId;
    private String supplierCode;
    private String supplierName;
    private String invoiceCode;
    private LocalDate debtDate;
    private LocalDate dueDate;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;
    private String status;
    private String paymentMethod;
    private String paymentReference;
    private LocalDate lastPaymentDate;
    private String paymentNotes;
    private String paidBy;
    private LocalDateTime createdAt;

    public SupplierDebtDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPoId() { return poId; }
    public void setPoId(Long poId) { this.poId = poId; }
    public String getPoCode() { return poCode; }
    public void setPoCode(String poCode) { this.poCode = poCode; }
    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
    public String getSupplierCode() { return supplierCode; }
    public void setSupplierCode(String supplierCode) { this.supplierCode = supplierCode; }
    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }
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
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
