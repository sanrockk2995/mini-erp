package com.erp.modules.warehouse.repository;

import com.erp.modules.warehouse.entity.Inventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByWarehouseIdAndProductId(Long warehouseId, Long productId);

    List<Inventory> findByWarehouseId(Long warehouseId);

    List<Inventory> findByProductId(Long productId);

    @Query("SELECT i FROM Inventory i WHERE " +
           "(:warehouseId IS NULL OR i.warehouse.id = :warehouseId) " +
           "AND (:keyword IS NULL OR LOWER(i.product.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(i.product.sku) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Inventory> searchInventory(@Param("warehouseId") Long warehouseId,
                                    @Param("keyword") String keyword,
                                    Pageable pageable);

    @Query("SELECT i FROM Inventory i WHERE i.quantityAvailable < 10.0")
    List<Inventory> findLowStockItems();
}
