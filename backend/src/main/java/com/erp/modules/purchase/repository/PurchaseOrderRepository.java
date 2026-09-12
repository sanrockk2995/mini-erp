package com.erp.modules.purchase.repository;

import com.erp.modules.purchase.entity.PurchaseOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    Optional<PurchaseOrder> findByPoCode(String poCode);

    boolean existsByPoCode(String poCode);

    @Query("SELECT po FROM PurchaseOrder po WHERE " +
           "(:supplierId IS NULL OR po.supplier.id = :supplierId) AND " +
           "(:warehouseId IS NULL OR po.warehouse.id = :warehouseId) AND " +
           "(:status IS NULL OR po.status = :status) AND " +
           "(:fromDate IS NULL OR po.orderDate >= :fromDate) AND " +
           "(:toDate IS NULL OR po.orderDate <= :toDate) AND " +
           "(:keyword IS NULL OR LOWER(po.poCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(po.supplier.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<PurchaseOrder> searchPurchaseOrders(@Param("supplierId") Long supplierId,
                                            @Param("warehouseId") Long warehouseId,
                                            @Param("status") String status,
                                            @Param("fromDate") LocalDate fromDate,
                                            @Param("toDate") LocalDate toDate,
                                            @Param("keyword") String keyword,
                                            Pageable pageable);
}
