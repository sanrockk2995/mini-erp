package com.erp.modules.purchase.repository;

import com.erp.modules.purchase.entity.SupplierPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierPaymentRepository extends JpaRepository<SupplierPayment, Long> {
    List<SupplierPayment> findByDebtIdOrderByPaymentDateDesc(Long debtId);
    List<SupplierPayment> findBySupplierIdOrderByPaymentDateDesc(Long supplierId);
    boolean existsByPaymentCode(String paymentCode);
}
