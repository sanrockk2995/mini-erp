package com.erp.modules.supplier.repository;

import com.erp.modules.supplier.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    Optional<Supplier> findByCode(String code);

    boolean existsByCode(String code);

    List<Supplier> findByIsActiveTrue();

    @Query("SELECT s FROM Supplier s WHERE " +
           "(:tier IS NULL OR s.ratingTier = :tier) AND " +
           "(:isActive IS NULL OR s.isActive = :isActive) AND " +
           "(:keyword IS NULL OR LOWER(s.code) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(s.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(s.productGroups) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Supplier> searchSuppliers(@Param("tier") String tier,
                                   @Param("isActive") Boolean isActive,
                                   @Param("keyword") String keyword,
                                   Pageable pageable);
}
