package com.erp.modules.product.repository;

import com.erp.modules.product.entity.PriceList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PriceListRepository extends JpaRepository<PriceList, Long> {
    Optional<PriceList> findByCode(String code);
    boolean existsByCode(String code);
    List<PriceList> findByCustomerGroupIdAndIsActiveTrue(Long customerGroupId);
}
