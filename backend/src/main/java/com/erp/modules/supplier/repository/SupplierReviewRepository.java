package com.erp.modules.supplier.repository;

import com.erp.modules.supplier.entity.SupplierReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierReviewRepository extends JpaRepository<SupplierReview, Long> {
    List<SupplierReview> findBySupplierIdOrderByReviewDateDesc(Long supplierId);
}
