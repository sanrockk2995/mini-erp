package com.erp.modules.customer.service;

import com.erp.common.PageResponse;
import com.erp.exception.AppException;
import com.erp.exception.ResourceNotFoundException;
import com.erp.modules.customer.dto.CustomerDto;
import com.erp.modules.customer.dto.CustomerPurchaseHistoryDto;
import com.erp.modules.customer.dto.CustomerRequest;
import com.erp.modules.customer.entity.Customer;
import com.erp.modules.customer.repository.CustomerRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final EntityManager entityManager;

    public CustomerService(CustomerRepository customerRepository,
                           EntityManager entityManager) {
        this.customerRepository = customerRepository;
        this.entityManager = entityManager;
    }

    @Transactional(readOnly = true)
    public PageResponse<CustomerDto> search(String keyword, String groupName, Boolean isActive, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<Customer> customerPage = customerRepository.searchCustomers(
                keyword != null && !keyword.trim().isEmpty() ? keyword.trim() : null,
                groupName != null && !groupName.trim().isEmpty() ? groupName.trim() : null,
                isActive,
                pageable
        );

        List<CustomerDto> dtos = new ArrayList<>();
        for (Customer customer : customerPage.getContent()) {
            dtos.add(mapToDto(customer));
        }

        return new PageResponse<>(
                dtos,
                customerPage.getNumber(),
                customerPage.getSize(),
                customerPage.getTotalElements(),
                customerPage.getTotalPages(),
                customerPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public List<CustomerDto> getAllActive() {
        List<Customer> customers = customerRepository.findByIsActiveTrue();
        List<CustomerDto> dtos = new ArrayList<>();
        for (Customer c : customers) {
            dtos.add(mapToDto(c));
        }
        return dtos;
    }

    @Transactional(readOnly = true)
    public CustomerDto getById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", "id", id));
        return mapToDto(customer);
    }

    @Transactional
    public CustomerDto create(CustomerRequest request) {
        if (customerRepository.existsByCode(request.getCode())) {
            throw new AppException(400, "Mã khách hàng đã tồn tại: " + request.getCode());
        }

        Customer customer = new Customer();
        customer.setCode(request.getCode());
        customer.setName(request.getName());
        customer.setCustomerType(request.getCustomerType() != null ? request.getCustomerType() : "INDIVIDUAL");
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());
        customer.setTaxCode(request.getTaxCode());
        customer.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        if (request.getGroupName() != null && !request.getGroupName().trim().isEmpty()) {
            customer.setGroupName(request.getGroupName().trim());
        } else {
            customer.setGroupName("Khách Hàng Mua Lẻ");
        }

        if (request.getDiscountPercent() != null) {
            customer.setDiscountPercent(request.getDiscountPercent());
        } else {
            customer.setDiscountPercent(getDefaultDiscountForGroup(customer.getGroupName()));
        }

        Customer saved = customerRepository.save(customer);
        return mapToDto(saved);
    }

    @Transactional
    public CustomerDto update(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", "id", id));

        if (!customer.getCode().equals(request.getCode()) && customerRepository.existsByCode(request.getCode())) {
            throw new AppException(400, "Mã khách hàng đã tồn tại: " + request.getCode());
        }

        customer.setCode(request.getCode());
        customer.setName(request.getName());
        customer.setCustomerType(request.getCustomerType() != null ? request.getCustomerType() : "INDIVIDUAL");
        customer.setPhone(request.getPhone());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());
        customer.setTaxCode(request.getTaxCode());
        if (request.getIsActive() != null) customer.setIsActive(request.getIsActive());

        if (request.getGroupName() != null && !request.getGroupName().trim().isEmpty()) {
            customer.setGroupName(request.getGroupName().trim());
        }
        if (request.getDiscountPercent() != null) {
            customer.setDiscountPercent(request.getDiscountPercent());
        }

        Customer saved = customerRepository.save(customer);
        return mapToDto(saved);
    }

    @Transactional
    public void delete(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", "id", id));
        customerRepository.delete(customer);
    }

    @Transactional(readOnly = true)
    public CustomerPurchaseHistoryDto getPurchaseHistory(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", "id", customerId));

        CustomerPurchaseHistoryDto history = new CustomerPurchaseHistoryDto();
        history.setCustomerId(customer.getId());
        history.setCustomerCode(customer.getCode());
        history.setCustomerName(customer.getName());

        String sql = "SELECT id, order_code, order_date, total_amount, status FROM sales_orders " +
                     "WHERE customer_id = :customerId ORDER BY order_date DESC, id DESC";
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("customerId", customerId);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();

        List<CustomerPurchaseHistoryDto.OrderItemSummaryDto> orderSummaries = new ArrayList<>();
        BigDecimal totalSpent = BigDecimal.ZERO;
        LocalDate lastDate = null;

        for (Object[] row : rows) {
            Long orderId = ((Number) row[0]).longValue();
            String orderCode = (String) row[1];
            LocalDate orderDate = row[2] instanceof Date ? ((Date) row[2]).toLocalDate() : null;
            BigDecimal totalAmount = row[3] != null ? new BigDecimal(row[3].toString()) : BigDecimal.ZERO;
            String status = (String) row[4];

            if (lastDate == null && orderDate != null) {
                lastDate = orderDate;
            }
            if ("COMPLETED".equalsIgnoreCase(status) || "APPROVED".equalsIgnoreCase(status) || "DELIVERING".equalsIgnoreCase(status)) {
                totalSpent = totalSpent.add(totalAmount);
            }

            orderSummaries.add(new CustomerPurchaseHistoryDto.OrderItemSummaryDto(orderId, orderCode, orderDate, totalAmount, status));
        }

        history.setTotalOrders(orderSummaries.size());
        history.setTotalSpent(totalSpent);
        history.setLastOrderDate(lastDate);
        history.setOrders(orderSummaries);

        return history;
    }

    public CustomerDto mapToDto(Customer c) {
        CustomerDto dto = new CustomerDto();
        dto.setId(c.getId());
        dto.setCode(c.getCode());
        dto.setName(c.getName());
        dto.setCustomerType(c.getCustomerType());
        dto.setPhone(c.getPhone());
        dto.setEmail(c.getEmail());
        dto.setAddress(c.getAddress());
        dto.setTaxCode(c.getTaxCode());
        dto.setGroupName(c.getGroupName());
        dto.setDiscountPercent(c.getDiscountPercent() != null ? c.getDiscountPercent() : BigDecimal.ZERO);
        dto.setGroupDiscountPercent(dto.getDiscountPercent());
        dto.setIsActive(c.getIsActive());
        dto.setCreatedAt(c.getCreatedAt());
        return dto;
    }

    private BigDecimal getDefaultDiscountForGroup(String groupName) {
        if (groupName == null) return BigDecimal.ZERO;
        if (groupName.contains("VIP")) return new BigDecimal("10.00");
        if (groupName.contains("Buôn") || groupName.contains("Sỉ") || groupName.contains("Đại Lý")) return new BigDecimal("15.00");
        if (groupName.contains("Thân Thiết")) return new BigDecimal("5.00");
        return BigDecimal.ZERO;
    }
}
