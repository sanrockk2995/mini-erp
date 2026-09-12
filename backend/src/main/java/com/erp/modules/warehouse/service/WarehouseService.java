package com.erp.modules.warehouse.service;

import com.erp.exception.AppException;
import com.erp.exception.ResourceNotFoundException;
import com.erp.modules.warehouse.dto.WarehouseDto;
import com.erp.modules.warehouse.dto.WarehouseRequest;
import com.erp.modules.warehouse.entity.Warehouse;
import com.erp.modules.warehouse.repository.WarehouseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    public WarehouseService(WarehouseRepository warehouseRepository) {
        this.warehouseRepository = warehouseRepository;
    }

    @Transactional(readOnly = true)
    public List<WarehouseDto> getAll() {
        List<Warehouse> list = warehouseRepository.findAll();
        List<WarehouseDto> dtos = new ArrayList<>();
        for (Warehouse w : list) {
            dtos.add(mapToDto(w));
        }
        return dtos;
    }

    @Transactional(readOnly = true)
    public List<WarehouseDto> getActive() {
        List<Warehouse> list = warehouseRepository.findByIsActiveTrue();
        List<WarehouseDto> dtos = new ArrayList<>();
        for (Warehouse w : list) {
            dtos.add(mapToDto(w));
        }
        return dtos;
    }

    @Transactional(readOnly = true)
    public WarehouseDto getById(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kho", "id", id));
        return mapToDto(warehouse);
    }

    @Transactional
    public WarehouseDto create(WarehouseRequest request) {
        if (warehouseRepository.existsByCode(request.getCode())) {
            throw new AppException(400, "Mã kho đã tồn tại: " + request.getCode());
        }

        Warehouse warehouse = new Warehouse();
        warehouse.setCode(request.getCode());
        warehouse.setName(request.getName());
        warehouse.setAddress(request.getAddress());
        warehouse.setManagerName(request.getManagerName());
        warehouse.setPhone(request.getPhone());
        warehouse.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        Warehouse saved = warehouseRepository.save(warehouse);
        return mapToDto(saved);
    }

    @Transactional
    public WarehouseDto update(Long id, WarehouseRequest request) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kho", "id", id));

        if (!warehouse.getCode().equals(request.getCode()) && warehouseRepository.existsByCode(request.getCode())) {
            throw new AppException(400, "Mã kho đã tồn tại: " + request.getCode());
        }

        warehouse.setCode(request.getCode());
        warehouse.setName(request.getName());
        warehouse.setAddress(request.getAddress());
        warehouse.setManagerName(request.getManagerName());
        warehouse.setPhone(request.getPhone());
        if (request.getIsActive() != null) warehouse.setIsActive(request.getIsActive());

        Warehouse saved = warehouseRepository.save(warehouse);
        return mapToDto(saved);
    }

    private WarehouseDto mapToDto(Warehouse w) {
        return new WarehouseDto(
                w.getId(),
                w.getCode(),
                w.getName(),
                w.getAddress(),
                w.getManagerName(),
                w.getPhone(),
                w.getIsActive()
        );
    }
}
