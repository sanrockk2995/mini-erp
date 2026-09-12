package com.erp.modules.warehouse.repository;

import com.erp.modules.warehouse.entity.GoodsIssueNote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GoodsIssueNoteRepository extends JpaRepository<GoodsIssueNote, Long> {

    Optional<GoodsIssueNote> findByGinCode(String ginCode);

    boolean existsByGinCode(String ginCode);

    @Query("SELECT g FROM GoodsIssueNote g WHERE " +
           "(:warehouseId IS NULL OR g.warehouse.id = :warehouseId) AND " +
           "(:status IS NULL OR g.status = :status) AND " +
           "(:keyword IS NULL OR LOWER(g.ginCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(g.notes) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<GoodsIssueNote> searchNotes(@Param("warehouseId") Long warehouseId,
                                    @Param("status") String status,
                                    @Param("keyword") String keyword,
                                    Pageable pageable);

    Optional<GoodsIssueNote> findBySalesOrderId(Long soId);
}
