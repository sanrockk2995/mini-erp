package com.erp.modules.customer.service;

import com.erp.exception.AppException;
import com.erp.exception.ResourceNotFoundException;
import com.erp.modules.customer.dto.CustomerGroupDto;
import com.erp.modules.customer.dto.CustomerGroupRequest;
import com.erp.modules.customer.entity.CustomerGroup;
import com.erp.modules.customer.repository.CustomerGroupRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class CustomerGroupService {

    private final CustomerGroupRepository customerGroupRepository;

    public CustomerGroupService(CustomerGroupRepository customerGroupRepository) {
        this.customerGroupRepository = customerGroupRepository;
    }

    @Transactional(readOnly = true)
    public List<CustomerGroupDto> getAll() {
        List<CustomerGroup> list = customerGroupRepository.findAll();
        List<CustomerGroupDto> dtos = new ArrayList<>();
        for (CustomerGroup g : list) {
            dtos.add(mapToDto(g));
        }
        return dtos;
    }

    @Transactional(readOnly = true)
    public CustomerGroupDto getById(Long id) {
        CustomerGroup group = customerGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nhóm khách hàng", "id", id));
        return mapToDto(group);
    }

    @Transactional
    public CustomerGroupDto create(CustomerGroupRequest request) {
        if (customerGroupRepository.existsByCode(request.getCode())) {
            throw new AppException(400, "Mã nhóm khách hàng đã tồn tại: " + request.getCode());
        }

        CustomerGroup group = new CustomerGroup();
        group.setCode(request.getCode());
        group.setName(request.getName());
        group.setDiscountPercent(request.getDiscountPercent());
        group.setDescription(request.getDescription());

        CustomerGroup saved = customerGroupRepository.save(group);
        return mapToDto(saved);
    }

    @Transactional
    public CustomerGroupDto update(Long id, CustomerGroupRequest request) {
        CustomerGroup group = customerGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nhóm khách hàng", "id", id));

        if (!group.getCode().equals(request.getCode()) && customerGroupRepository.existsByCode(request.getCode())) {
            throw new AppException(400, "Mã nhóm khách hàng đã tồn tại: " + request.getCode());
        }

        group.setCode(request.getCode());
        group.setName(request.getName());
        group.setDiscountPercent(request.getDiscountPercent());
        group.setDescription(request.getDescription());

        CustomerGroup saved = customerGroupRepository.save(group);
        return mapToDto(saved);
    }

    @Transactional
    public void delete(Long id) {
        CustomerGroup group = customerGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nhóm khách hàng", "id", id));
        customerGroupRepository.delete(group);
    }

    private CustomerGroupDto mapToDto(CustomerGroup g) {
        return new CustomerGroupDto(
                g.getId(),
                g.getCode(),
                g.getName(),
                g.getDiscountPercent(),
                g.getDescription()
        );
    }
}
