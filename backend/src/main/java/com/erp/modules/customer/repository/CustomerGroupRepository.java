package com.erp.modules.customer.repository;

import com.erp.modules.customer.entity.CustomerGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerGroupRepository extends JpaRepository<CustomerGroup, Long> {
    Optional<CustomerGroup> findByCode(String code);
    boolean existsByCode(String code);
}
