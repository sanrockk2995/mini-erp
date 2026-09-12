package com.erp.modules.product.repository;

import com.erp.modules.product.entity.PriceListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PriceListItemRepository extends JpaRepository<PriceListItem, Long> {
    List<PriceListItem> findByPriceListId(Long priceListId);
    Optional<PriceListItem> findByPriceListIdAndProductId(Long priceListId, Long productId);
    List<PriceListItem> findByProductId(Long productId);
}
