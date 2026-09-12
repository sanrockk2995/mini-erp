package com.erp.modules.warehouse.repository;

import com.erp.modules.warehouse.entity.StockLedger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockLedgerRepository extends JpaRepository<StockLedger, Long> {
    @Query("SELECT sl FROM StockLedger sl WHERE " +
           "(:warehouseId IS NULL OR sl.warehouse.id = :warehouseId) " +
           "AND (:productId IS NULL OR sl.product.id = :productId) " +
           "AND (:transactionType IS NULL OR sl.transactionType = :transactionType) " +
           "ORDER BY sl.createdAt DESC")
    Page<StockLedger> searchLedger(@Param("warehouseId") Long warehouseId,
                                   @Param("productId") Long productId,
                                   @Param("transactionType") String transactionType,
                                   Pageable pageable);

    List<StockLedger> findByProductIdOrderByCreatedAtDesc(Long productId);
}
