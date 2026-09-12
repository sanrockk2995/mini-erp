package com.erp.modules.purchase.repository;

import com.erp.modules.purchase.entity.SupplierDebt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface SupplierDebtRepository extends JpaRepository<SupplierDebt, Long> {

    Optional<SupplierDebt> findByInvoiceCode(String invoiceCode);

    boolean existsByInvoiceCode(String invoiceCode);

    Optional<SupplierDebt> findByPurchaseOrderId(Long poId);

    @Query("SELECT d FROM SupplierDebt d WHERE " +
           "(:supplierId IS NULL OR d.supplier.id = :supplierId) AND " +
           "(:status IS NULL OR d.status = :status) AND " +
           "(:keyword IS NULL OR LOWER(d.invoiceCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(d.supplier.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<SupplierDebt> searchDebts(@Param("supplierId") Long supplierId,
                                  @Param("status") String status,
                                  @Param("keyword") String keyword,
                                  Pageable pageable);

    @Query("SELECT COALESCE(SUM(d.remainingAmount), 0) FROM SupplierDebt d WHERE d.supplier.id = :supplierId AND d.status <> 'PAID'")
    BigDecimal getTotalRemainingDebtBySupplier(@Param("supplierId") Long supplierId);

    @Query("SELECT COALESCE(SUM(d.remainingAmount), 0) FROM SupplierDebt d WHERE d.status <> 'PAID'")
    BigDecimal getTotalSystemRemainingDebt();
}
