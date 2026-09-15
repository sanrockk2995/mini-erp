package com.erp.modules.purchase.service;

import com.erp.common.PageResponse;
import com.erp.exception.BusinessException;
import com.erp.exception.ResourceNotFoundException;
import com.erp.modules.purchase.dto.SupplierDebtDto;
import com.erp.modules.purchase.dto.SupplierPaymentDto;
import com.erp.modules.purchase.dto.SupplierPaymentRequest;
import com.erp.modules.purchase.entity.PurchaseOrder;
import com.erp.modules.purchase.entity.SupplierDebt;
import com.erp.modules.purchase.repository.SupplierDebtRepository;
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

    public SupplierDebtService(SupplierDebtRepository debtRepository) {
        this.debtRepository = debtRepository;
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

        // Cập nhật công nợ và ghi nhận thanh toán trực tiếp (Zero-Join Model)
        debt.setPaidAmount(debt.getPaidAmount().add(request.getAmount()));
        debt.setRemainingAmount(debt.getTotalAmount().subtract(debt.getPaidAmount()));
        debt.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "BANK_TRANSFER");
        debt.setPaymentReference(request.getReferenceNumber());
        debt.setLastPaymentDate(request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now());
        debt.setPaymentNotes(request.getNotes());
        debt.setPaidBy(username != null ? username : "SYSTEM");

        if (debt.getRemainingAmount().compareTo(BigDecimal.ZERO) == 0) {
            debt.setStatus("PAID");
        } else {
            debt.setStatus("PARTIAL");
        }
        SupplierDebt savedDebt = debtRepository.save(debt);

        return mapToPaymentDto(savedDebt, request.getAmount());
    }

    @Transactional(readOnly = true)
    public List<SupplierPaymentDto> getPaymentsByDebt(Long debtId) {
        SupplierDebt debt = debtRepository.findById(debtId)
                .orElseThrow(() -> new ResourceNotFoundException("Công nợ", "id", debtId));
        List<SupplierPaymentDto> dtos = new ArrayList<>();
        if (debt.getPaidAmount() != null && debt.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {
            dtos.add(mapToPaymentDto(debt, debt.getPaidAmount()));
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
        dto.setPaymentMethod(debt.getPaymentMethod());
        dto.setPaymentReference(debt.getPaymentReference());
        dto.setLastPaymentDate(debt.getLastPaymentDate());
        dto.setPaymentNotes(debt.getPaymentNotes());
        dto.setPaidBy(debt.getPaidBy());
        dto.setCreatedAt(debt.getCreatedAt());
        return dto;
    }

    public SupplierPaymentDto mapToPaymentDto(SupplierDebt debt, BigDecimal amount) {
        SupplierPaymentDto dto = new SupplierPaymentDto();
        dto.setId(debt.getId());
        dto.setPaymentCode(debt.getPaymentReference() != null ? debt.getPaymentReference() : "PAY-" + debt.getInvoiceCode());
        dto.setDebtId(debt.getId());
        dto.setInvoiceCode(debt.getInvoiceCode());
        dto.setSupplierId(debt.getSupplier().getId());
        dto.setSupplierCode(debt.getSupplier().getCode());
        dto.setSupplierName(debt.getSupplier().getName());
        dto.setPaymentDate(debt.getLastPaymentDate() != null ? debt.getLastPaymentDate() : LocalDate.now());
        dto.setAmount(amount != null ? amount : debt.getPaidAmount());
        dto.setPaymentMethod(debt.getPaymentMethod() != null ? debt.getPaymentMethod() : "BANK_TRANSFER");
        dto.setReferenceNumber(debt.getPaymentReference());
        dto.setNotes(debt.getPaymentNotes());
        dto.setCreatedBy(debt.getPaidBy() != null ? debt.getPaidBy() : "SYSTEM");
        dto.setCreatedAt(debt.getUpdatedAt() != null ? debt.getUpdatedAt() : debt.getCreatedAt());
        return dto;
    }
}
