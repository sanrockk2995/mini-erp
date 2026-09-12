package com.erp.modules.purchase.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class SupplierPaymentRequest {

    @NotNull(message = "Khoản nợ không được để trống")
    private Long debtId;

    private LocalDate paymentDate;

    @NotNull(message = "Số tiền thanh toán không được để trống")
    @DecimalMin(value = "1.0", message = "Số tiền thanh toán phải lớn hơn 0")
    private BigDecimal amount;

    private String paymentMethod = "BANK_TRANSFER"; // CASH, BANK_TRANSFER

    private String referenceNumber;

    private String notes;

    public SupplierPaymentRequest() {}

    public Long getDebtId() { return debtId; }
    public void setDebtId(Long debtId) { this.debtId = debtId; }
    public LocalDate getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
