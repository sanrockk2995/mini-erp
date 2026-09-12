package com.erp.modules.warehouse.repository;

import com.erp.modules.warehouse.entity.GoodsIssueItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoodsIssueItemRepository extends JpaRepository<GoodsIssueItem, Long> {
    List<GoodsIssueItem> findByGoodsIssueNoteId(Long ginId);
}
