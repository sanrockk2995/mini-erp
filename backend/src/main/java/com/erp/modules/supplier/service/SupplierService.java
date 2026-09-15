package com.erp.modules.supplier.service;

import com.erp.common.PageResponse;
import com.erp.exception.AppException;
import com.erp.exception.ResourceNotFoundException;
import com.erp.modules.purchase.entity.SupplierDebt;
import com.erp.modules.purchase.repository.SupplierDebtRepository;
import com.erp.modules.supplier.dto.*;
import com.erp.modules.supplier.entity.Supplier;
import com.erp.modules.supplier.repository.SupplierRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierDebtRepository supplierDebtRepository;

    public SupplierService(SupplierRepository supplierRepository,
                           SupplierDebtRepository supplierDebtRepository) {
        this.supplierRepository = supplierRepository;
        this.supplierDebtRepository = supplierDebtRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<SupplierDto> searchSuppliers(String tier, Boolean isActive, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<Supplier> suppPage = supplierRepository.searchSuppliers(
                tier != null && !tier.trim().isEmpty() ? tier.trim() : null,
                isActive,
                keyword != null && !keyword.trim().isEmpty() ? keyword.trim() : null,
                pageable
        );

        List<SupplierDto> dtos = new ArrayList<>();
        for (Supplier s : suppPage.getContent()) {
            SupplierDto dto = mapToDto(s);
            dto.setCurrentDebt(supplierDebtRepository.getTotalRemainingDebtBySupplier(s.getId()));
            dtos.add(dto);
        }

        return new PageResponse<>(
                dtos,
                suppPage.getNumber(),
                suppPage.getSize(),
                suppPage.getTotalElements(),
                suppPage.getTotalPages(),
                suppPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public List<SupplierDto> getAllActive() {
        List<Supplier> list = supplierRepository.findByIsActiveTrue();
        List<SupplierDto> dtos = new ArrayList<>();
        for (Supplier s : list) {
            dtos.add(mapToDto(s));
        }
        return dtos;
    }

    @Transactional(readOnly = true)
    public SupplierDto getById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nhà cung cấp", "id", id));
        SupplierDto dto = mapToDto(supplier);
        dto.setCurrentDebt(supplierDebtRepository.getTotalRemainingDebtBySupplier(supplier.getId()));
        return dto;
    }

    @Transactional
    public SupplierDto create(SupplierRequest request) {
        if (supplierRepository.existsByCode(request.getCode())) {
            throw new AppException(400, "Mã nhà cung cấp đã tồn tại: " + request.getCode());
        }

        Supplier supplier = new Supplier();
        supplier.setCode(request.getCode());
        supplier.setName(request.getName());
        supplier.setPhone(request.getPhone());
        supplier.setEmail(request.getEmail());
        supplier.setAddress(request.getAddress());
        supplier.setTaxCode(request.getTaxCode());
        supplier.setProductGroups(request.getProductGroups());
        supplier.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        supplier.setQualityScore(BigDecimal.ZERO);
        supplier.setDeliveryScore(BigDecimal.ZERO);
        supplier.setPriceScore(BigDecimal.ZERO);
        supplier.setRatingScore(BigDecimal.ZERO);
        supplier.setRatingTier("B");

        Supplier saved = supplierRepository.save(supplier);
        return mapToDto(saved);
    }

    @Transactional
    public SupplierDto update(Long id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nhà cung cấp", "id", id));

        if (!supplier.getCode().equals(request.getCode()) && supplierRepository.existsByCode(request.getCode())) {
            throw new AppException(400, "Mã nhà cung cấp đã tồn tại: " + request.getCode());
        }

        supplier.setCode(request.getCode());
        supplier.setName(request.getName());
        supplier.setPhone(request.getPhone());
        supplier.setEmail(request.getEmail());
        supplier.setAddress(request.getAddress());
        supplier.setTaxCode(request.getTaxCode());
        supplier.setProductGroups(request.getProductGroups());
        if (request.getIsActive() != null) supplier.setIsActive(request.getIsActive());

        Supplier saved = supplierRepository.save(supplier);
        return mapToDto(saved);
    }

    @Transactional
    public SupplierReviewDto addReview(Long supplierId, SupplierReviewRequest request, Long reviewerId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Nhà cung cấp", "id", supplierId));

        BigDecimal avg = request.getQualityScore()
                .add(request.getDeliveryScore())
                .add(request.getPriceScore())
                .divide(BigDecimal.valueOf(3), 1, RoundingMode.HALF_UP);

        supplier.setQualityScore(request.getQualityScore());
        supplier.setDeliveryScore(request.getDeliveryScore());
        supplier.setPriceScore(request.getPriceScore());
        supplier.setRatingScore(avg);
        supplier.setReviewDate(request.getReviewDate() != null ? request.getReviewDate() : LocalDate.now());
        supplier.setReviewNotes(request.getComments());

        // Xếp hạng: A (>= 8.5), B (>= 6.5), C (< 6.5)
        if (avg.compareTo(BigDecimal.valueOf(8.5)) >= 0) {
            supplier.setRatingTier("A");
        } else if (avg.compareTo(BigDecimal.valueOf(6.5)) >= 0) {
            supplier.setRatingTier("B");
        } else {
            supplier.setRatingTier("C");
        }

        Supplier saved = supplierRepository.save(supplier);
        return mapSupplierToReviewDto(saved, reviewerId);
    }

    @Transactional(readOnly = true)
    public List<SupplierReviewDto> getReviews(Long supplierId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Nhà cung cấp", "id", supplierId));

        if (supplier.getReviewDate() == null && (supplier.getRatingScore() == null || supplier.getRatingScore().compareTo(BigDecimal.ZERO) == 0)) {
            return List.of();
        }
        return List.of(mapSupplierToReviewDto(supplier, null));
    }

    @Transactional(readOnly = true)
    public SupplierDebtSummaryDto getDebtSummary(Long supplierId) {
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Nhà cung cấp", "id", supplierId));

        Page<SupplierDebt> debtsPage = supplierDebtRepository.searchDebts(supplierId, null, null, Pageable.unpaged());

        BigDecimal total = BigDecimal.ZERO;
        BigDecimal paid = BigDecimal.ZERO;
        BigDecimal remaining = BigDecimal.ZERO;
        int unpaidCount = 0;

        for (SupplierDebt d : debtsPage.getContent()) {
            total = total.add(d.getTotalAmount());
            paid = paid.add(d.getPaidAmount());
            remaining = remaining.add(d.getRemainingAmount());
            if (!"PAID".equals(d.getStatus())) {
                unpaidCount++;
            }
        }

        SupplierDebtSummaryDto summary = new SupplierDebtSummaryDto();
        summary.setSupplierId(supplier.getId());
        summary.setSupplierCode(supplier.getCode());
        summary.setSupplierName(supplier.getName());
        summary.setTotalDebt(total);
        summary.setPaidDebt(paid);
        summary.setRemainingDebt(remaining);
        summary.setUnpaidInvoicesCount(unpaidCount);
        return summary;
    }

    private SupplierDto mapToDto(Supplier s) {
        SupplierDto dto = new SupplierDto();
        dto.setId(s.getId());
        dto.setCode(s.getCode());
        dto.setName(s.getName());
        dto.setPhone(s.getPhone());
        dto.setEmail(s.getEmail());
        dto.setAddress(s.getAddress());
        dto.setTaxCode(s.getTaxCode());
        dto.setProductGroups(s.getProductGroups());
        dto.setQualityScore(s.getQualityScore());
        dto.setDeliveryScore(s.getDeliveryScore());
        dto.setPriceScore(s.getPriceScore());
        dto.setRatingScore(s.getRatingScore());
        dto.setRatingTier(s.getRatingTier());
        dto.setReviewDate(s.getReviewDate());
        dto.setReviewNotes(s.getReviewNotes());
        dto.setIsActive(s.getIsActive());
        dto.setCreatedAt(s.getCreatedAt());
        return dto;
    }

    private SupplierReviewDto mapSupplierToReviewDto(Supplier s, Long reviewerId) {
        SupplierReviewDto dto = new SupplierReviewDto();
        dto.setId(s.getId());
        dto.setSupplierId(s.getId());
        dto.setReviewDate(s.getReviewDate() != null ? s.getReviewDate() : (s.getUpdatedAt() != null ? s.getUpdatedAt().toLocalDate() : LocalDate.now()));
        dto.setQualityScore(s.getQualityScore() != null ? s.getQualityScore() : BigDecimal.ZERO);
        dto.setDeliveryScore(s.getDeliveryScore() != null ? s.getDeliveryScore() : BigDecimal.ZERO);
        dto.setPriceScore(s.getPriceScore() != null ? s.getPriceScore() : BigDecimal.ZERO);
        dto.setAverageScore(s.getRatingScore() != null ? s.getRatingScore() : BigDecimal.ZERO);
        dto.setReviewerId(reviewerId);
        dto.setComments(s.getReviewNotes());
        dto.setCreatedAt(s.getUpdatedAt() != null ? s.getUpdatedAt() : s.getCreatedAt());
        return dto;
    }
}
