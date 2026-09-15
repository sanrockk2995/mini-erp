package com.erp.modules.customer.service;

import com.erp.modules.customer.dto.CustomerGroupDto;
import com.erp.modules.customer.dto.CustomerGroupRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class CustomerGroupService {

    private final ConcurrentHashMap<Long, CustomerGroupDto> virtualGroups = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(3);

    public CustomerGroupService() {
        virtualGroups.put(1L, new CustomerGroupDto(1L, "RETAIL", "Khách Hàng Mua Lẻ", new BigDecimal("0.00"), "Khách hàng mua lẻ vãng lai, giá niêm yết"));
        virtualGroups.put(2L, new CustomerGroupDto(2L, "VIP", "Khách Hàng Thân Thiết VIP", new BigDecimal("10.00"), "Khách hàng VIP, chiết khấu 10%"));
        virtualGroups.put(3L, new CustomerGroupDto(3L, "WHOLESALE", "Khách Hàng Mua Buôn / Đại Lý", new BigDecimal("15.00"), "Đại lý phân phối sỉ thời trang, chiết khấu 15%"));
    }

    public List<CustomerGroupDto> getAll() {
        return new ArrayList<>(virtualGroups.values());
    }

    public CustomerGroupDto getById(Long id) {
        CustomerGroupDto group = virtualGroups.get(id);
        if (group == null) {
            return new CustomerGroupDto(id, "GROUP-" + id, "Nhóm Khách Hàng " + id, BigDecimal.ZERO, "Nhóm khách hàng");
        }
        return group;
    }

    public CustomerGroupDto create(CustomerGroupRequest request) {
        long id = idGenerator.incrementAndGet();
        CustomerGroupDto dto = new CustomerGroupDto(
                id,
                request.getCode(),
                request.getName(),
                request.getDiscountPercent() != null ? request.getDiscountPercent() : BigDecimal.ZERO,
                request.getDescription()
        );
        virtualGroups.put(id, dto);
        return dto;
    }

    public CustomerGroupDto update(Long id, CustomerGroupRequest request) {
        CustomerGroupDto dto = new CustomerGroupDto(
                id,
                request.getCode(),
                request.getName(),
                request.getDiscountPercent() != null ? request.getDiscountPercent() : BigDecimal.ZERO,
                request.getDescription()
        );
        virtualGroups.put(id, dto);
        return dto;
    }

    public void delete(Long id) {
        virtualGroups.remove(id);
    }
}
