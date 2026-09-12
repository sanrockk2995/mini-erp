package com.erp.modules.sales.repository;

import com.erp.modules.sales.entity.SalesOrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalesOrderStatusHistoryRepository extends JpaRepository<SalesOrderStatusHistory, Long> {
    List<SalesOrderStatusHistory> findBySalesOrderIdOrderByChangedAtAsc(Long salesOrderId);
}
