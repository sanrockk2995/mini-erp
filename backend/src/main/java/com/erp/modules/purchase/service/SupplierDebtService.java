package com.erp.modules.purchase.service;

import com.erp.common.PageResponse;
import com.erp.exception.BusinessException;
import com.erp.exception.ResourceNotFoundException;
import com.erp.modules.purchase.dto.SupplierDebtDto;
import com.erp.modules.purchase.dto.SupplierPaymentDto;
import com.erp.modules.purchase.dto.SupplierPaymentRequest;
import com.erp.modules.purchase.entity.PurchaseOrder;
import com.erp.modules.purchase.entity.SupplierDebt;
import com.erp.modules.purchase.entity.SupplierPayment;
import com.erp.modules.purchase.repository.SupplierDebtRepository;
import com.erp.modules.purchase.repository.SupplierPaymentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class SupplierDebtService {

    private final SupplierDebtRepository debtRepository;
    private final SupplierPaymentRepository paymentRepository;

    public SupplierDebtService(SupplierDebtRepository debtRepository,
                               SupplierPaymentRepository paymentRepository) {
        this.debtRepository = debtRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<SupplierDebtDto> searchDebts(Long supplierId, String status, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<SupplierDebt> debtPage = debtRepository.searchDebts(
                supplierId,
                status != null && !status.trim().isEmpty() ? status.trim() : null,
                keyword != null && !keyword.trim().isEmpty() ? keyword.trim() : null,
                pageable
        );

        List<SupplierDebtDto> dtos = new ArrayList<>();
        for (SupplierDebt d : debtPage.getContent()) {
            dtos.add(mapToDto(d));
        }

        return new PageResponse<>(
                dtos,
                debtPage.getNumber(),
                debtPage.getSize(),
                debtPage.getTotalElements(),
                debtPage.getTotalPages(),
                debtPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public SupplierDebtDto getById(Long id) {
        SupplierDebt debt = debtRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Công nợ", "id", id));
        return mapToDto(debt);
    }

    @Transactional
    public SupplierDebt createDebtFromPurchaseOrder(PurchaseOrder po, BigDecimal totalAmount) {
        SupplierDebt debt = new SupplierDebt();
        debt.setPurchaseOrder(po);
        debt.setSupplier(po.getSupplier());
        debt.setInvoiceCode(generateInvoiceCode(po.getPoCode()));
        debt.setDebtDate(LocalDate.now());
        debt.setDueDate(LocalDate.now().plusDays(30)); // Mặc định hạn nợ 30 ngày
        debt.setTotalAmount(totalAmount != null ? totalAmount : po.getTotalAmount());
        debt.setPaidAmount(BigDecimal.ZERO);
        debt.setRemainingAmount(debt.getTotalAmount());
        debt.setStatus("UNPAID");

        return debtRepository.save(debt);
    }

    @Transactional
    public SupplierPaymentDto recordPayment(SupplierPaymentRequest request, String username) {
        SupplierDebt debt = debtRepository.findById(request.getDebtId())
                .orElseThrow(() -> new ResourceNotFoundException("Công nợ", "id", request.getDebtId()));

        if ("PAID".equals(debt.getStatus())) {
            throw new BusinessException("Khoản nợ này đã được tất toán (PAID)");
        }

        if (request.getAmount().compareTo(debt.getRemainingAmount()) > 0) {
            throw new BusinessException(String.format("Số tiền thanh toán (%s) vượt quá số nợ còn lại (%s)",
                    request.getAmount(), debt.getRemainingAmount()));
        }

        SupplierPayment payment = new SupplierPayment();
        payment.setPaymentCode(generatePaymentCode());
        payment.setDebt(debt);
        payment.setSupplier(debt.getSupplier());
        payment.setPaymentDate(request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "BANK_TRANSFER");
        payment.setReferenceNumber(request.getReferenceNumber());
        payment.setNotes(request.getNotes());
        payment.setCreatedBy(username != null ? username : "SYSTEM");

        SupplierPayment savedPayment = paymentRepository.save(payment);

        // Cập nhật công nợ
        debt.setPaidAmount(debt.getPaidAmount().add(request.getAmount()));
        debt.setRemainingAmount(debt.getTotalAmount().subtract(debt.getPaidAmount()));

        if (debt.getRemainingAmount().compareTo(BigDecimal.ZERO) == 0) {
            debt.setStatus("PAID");
        } else {
            debt.setStatus("PARTIAL");
        }
        debtRepository.save(debt);

        return mapToPaymentDto(savedPayment);
    }

    @Transactional(readOnly = true)
    public List<SupplierPaymentDto> getPaymentsByDebt(Long debtId) {
        List<SupplierPayment> list = paymentRepository.findByDebtIdOrderByPaymentDateDesc(debtId);
        List<SupplierPaymentDto> dtos = new ArrayList<>();
        for (SupplierPayment p : list) {
            dtos.add(mapToPaymentDto(p));
        }
        return dtos;
    }

    private String generateInvoiceCode(String poCode) {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int rand = ThreadLocalRandom.current().nextInt(100, 999);
        String code = "INV-" + datePart + "-" + rand;
        while (debtRepository.existsByInvoiceCode(code)) {
            rand = ThreadLocalRandom.current().nextInt(100, 999);
            code = "INV-" + datePart + "-" + rand;
        }
        return code;
    }

    private String generatePaymentCode() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int rand = ThreadLocalRandom.current().nextInt(1000, 9999);
        String code = "PAY-" + datePart + "-" + rand;
        while (paymentRepository.existsByPaymentCode(code)) {
            rand = ThreadLocalRandom.current().nextInt(1000, 9999);
            code = "PAY-" + datePart + "-" + rand;
        }
        return code;
    }

    public SupplierDebtDto mapToDto(SupplierDebt debt) {
        SupplierDebtDto dto = new SupplierDebtDto();
        dto.setId(debt.getId());
        if (debt.getPurchaseOrder() != null) {
            dto.setPoId(debt.getPurchaseOrder().getId());
            dto.setPoCode(debt.getPurchaseOrder().getPoCode());
        }
        dto.setSupplierId(debt.getSupplier().getId());
        dto.setSupplierCode(debt.getSupplier().getCode());
        dto.setSupplierName(debt.getSupplier().getName());
        dto.setInvoiceCode(debt.getInvoiceCode());
        dto.setDebtDate(debt.getDebtDate());
        dto.setDueDate(debt.getDueDate());
        dto.setTotalAmount(debt.getTotalAmount());
        dto.setPaidAmount(debt.getPaidAmount());
        dto.setRemainingAmount(debt.getRemainingAmount());
        dto.setStatus(debt.getStatus());
        dto.setCreatedAt(debt.getCreatedAt());
        return dto;
    }

    public SupplierPaymentDto mapToPaymentDto(SupplierPayment p) {
        SupplierPaymentDto dto = new SupplierPaymentDto();
        dto.setId(p.getId());
        dto.setPaymentCode(p.getPaymentCode());
        dto.setDebtId(p.getDebt().getId());
        dto.setInvoiceCode(p.getDebt().getInvoiceCode());
        dto.setSupplierId(p.getSupplier().getId());
        dto.setSupplierCode(p.getSupplier().getCode());
        dto.setSupplierName(p.getSupplier().getName());
        dto.setPaymentDate(p.getPaymentDate());
        dto.setAmount(p.getAmount());
        dto.setPaymentMethod(p.getPaymentMethod());
        dto.setReferenceNumber(p.getReferenceNumber());
        dto.setNotes(p.getNotes());
        dto.setCreatedBy(p.getCreatedBy());
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }
}
