package com.erp.modules.sales.repository;

import com.erp.modules.sales.entity.SalesOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {

    Optional<SalesOrder> findByOrderCode(String orderCode);

    boolean existsByOrderCode(String orderCode);

    @Query("SELECT so FROM SalesOrder so WHERE " +
           "(:customerId IS NULL OR so.customer.id = :customerId) AND " +
           "(:warehouseId IS NULL OR so.warehouse.id = :warehouseId) AND " +
           "(:status IS NULL OR so.status = :status) AND " +
           "(:fromDate IS NULL OR so.orderDate >= :fromDate) AND " +
           "(:toDate IS NULL OR so.orderDate <= :toDate) AND " +
           "(:keyword IS NULL OR LOWER(so.orderCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(so.customer.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<SalesOrder> searchSalesOrders(@Param("customerId") Long customerId,
                                      @Param("warehouseId") Long warehouseId,
                                      @Param("status") String status,
                                      @Param("fromDate") LocalDate fromDate,
                                      @Param("toDate") LocalDate toDate,
                                      @Param("keyword") String keyword,
                                      Pageable pageable);
}
