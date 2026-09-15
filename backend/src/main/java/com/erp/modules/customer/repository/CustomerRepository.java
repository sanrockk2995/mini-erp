package com.erp.modules.customer.repository;

import com.erp.modules.customer.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByCode(String code);
    boolean existsByCode(String code);

    @Query("SELECT c FROM Customer c WHERE " +
           "(:keyword IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.code) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.phone) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:groupName IS NULL OR c.groupName = :groupName) " +
           "AND (:isActive IS NULL OR c.isActive = :isActive)")
    Page<Customer> searchCustomers(@Param("keyword") String keyword,
                                   @Param("groupName") String groupName,
                                   @Param("isActive") Boolean isActive,
                                   Pageable pageable);

    List<Customer> findByIsActiveTrue();
}
