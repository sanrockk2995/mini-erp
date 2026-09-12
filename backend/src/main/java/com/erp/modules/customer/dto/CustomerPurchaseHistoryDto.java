package com.erp.modules.customer.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class CustomerPurchaseHistoryDto {
    private Long customerId;
    private String customerCode;
    private String customerName;
    private int totalOrders;
    private BigDecimal totalSpent;
    private LocalDate lastOrderDate;
    private List<OrderItemSummaryDto> orders = new ArrayList<>();

    public CustomerPurchaseHistoryDto() {}

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public String getCustomerCode() { return customerCode; }
    public void setCustomerCode(String customerCode) { this.customerCode = customerCode; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public int getTotalOrders() { return totalOrders; }
    public void setTotalOrders(int totalOrders) { this.totalOrders = totalOrders; }
    public BigDecimal getTotalSpent() { return totalSpent; }
    public void setTotalSpent(BigDecimal totalSpent) { this.totalSpent = totalSpent; }
    public LocalDate getLastOrderDate() { return lastOrderDate; }
    public void setLastOrderDate(LocalDate lastOrderDate) { this.lastOrderDate = lastOrderDate; }
    public List<OrderItemSummaryDto> getOrders() { return orders; }
    public void setOrders(List<OrderItemSummaryDto> orders) { this.orders = orders; }

    public static class OrderItemSummaryDto {
        private Long orderId;
        private String orderCode;
        private LocalDate orderDate;
        private BigDecimal totalAmount;
        private String status;

        public OrderItemSummaryDto() {}

        public OrderItemSummaryDto(Long orderId, String orderCode, LocalDate orderDate, BigDecimal totalAmount, String status) {
            this.orderId = orderId;
            this.orderCode = orderCode;
            this.orderDate = orderDate;
            this.totalAmount = totalAmount;
            this.status = status;
        }

        public Long getOrderId() { return orderId; }
        public void setOrderId(Long orderId) { this.orderId = orderId; }
        public String getOrderCode() { return orderCode; }
        public void setOrderCode(String orderCode) { this.orderCode = orderCode; }
        public LocalDate getOrderDate() { return orderDate; }
        public void setOrderDate(LocalDate orderDate) { this.orderDate = orderDate; }
        public BigDecimal getTotalAmount() { return totalAmount; }
        public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
