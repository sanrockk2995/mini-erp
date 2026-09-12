package com.erp.modules.warehouse.repository;

import com.erp.modules.warehouse.entity.GoodsReceiptNote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GoodsReceiptNoteRepository extends JpaRepository<GoodsReceiptNote, Long> {

    Optional<GoodsReceiptNote> findByGrnCode(String grnCode);

    boolean existsByGrnCode(String grnCode);

    @Query("SELECT g FROM GoodsReceiptNote g WHERE " +
           "(:warehouseId IS NULL OR g.warehouse.id = :warehouseId) AND " +
           "(:status IS NULL OR g.status = :status) AND " +
           "(:keyword IS NULL OR LOWER(g.grnCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(g.notes) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<GoodsReceiptNote> searchNotes(@Param("warehouseId") Long warehouseId,
                                      @Param("status") String status,
                                      @Param("keyword") String keyword,
                                      Pageable pageable);

    Optional<GoodsReceiptNote> findByPurchaseOrderId(Long poId);
}
