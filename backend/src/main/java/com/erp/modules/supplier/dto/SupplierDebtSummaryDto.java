package com.erp.modules.supplier.dto;

import java.math.BigDecimal;

public class SupplierDebtSummaryDto {
    private Long supplierId;
    private String supplierCode;
    private String supplierName;
    private BigDecimal totalDebt;
    private BigDecimal paidDebt;
    private BigDecimal remainingDebt;
    private int unpaidInvoicesCount;

    public SupplierDebtSummaryDto() {}

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
    public String getSupplierCode() { return supplierCode; }
    public void setSupplierCode(String supplierCode) { this.supplierCode = supplierCode; }
    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }
    public BigDecimal getTotalDebt() { return totalDebt; }
    public void setTotalDebt(BigDecimal totalDebt) { this.totalDebt = totalDebt; }
    public BigDecimal getPaidDebt() { return paidDebt; }
    public void setPaidDebt(BigDecimal paidDebt) { this.paidDebt = paidDebt; }
    public BigDecimal getRemainingDebt() { return remainingDebt; }
    public void setRemainingDebt(BigDecimal remainingDebt) { this.remainingDebt = remainingDebt; }
    public int getUnpaidInvoicesCount() { return unpaidInvoicesCount; }
    public void setUnpaidInvoicesCount(int unpaidInvoicesCount) { this.unpaidInvoicesCount = unpaidInvoicesCount; }
}
