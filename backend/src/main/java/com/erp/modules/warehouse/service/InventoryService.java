package com.erp.modules.warehouse.service;

import com.erp.common.PageResponse;
import com.erp.exception.AppException;
import com.erp.exception.BusinessException;
import com.erp.exception.ResourceNotFoundException;
import com.erp.modules.product.entity.Product;
import com.erp.modules.product.repository.ProductRepository;
import com.erp.modules.warehouse.dto.InventoryDto;
import com.erp.modules.warehouse.dto.StockAdjustmentRequest;
import com.erp.modules.warehouse.dto.StockLedgerDto;
import com.erp.modules.warehouse.entity.Inventory;
import com.erp.modules.warehouse.entity.StockLedger;
import com.erp.modules.warehouse.entity.Warehouse;
import com.erp.modules.warehouse.repository.InventoryRepository;
import com.erp.modules.warehouse.repository.StockLedgerRepository;
import com.erp.modules.warehouse.repository.WarehouseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final StockLedgerRepository stockLedgerRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;

    public InventoryService(InventoryRepository inventoryRepository,
                            StockLedgerRepository stockLedgerRepository,
                            WarehouseRepository warehouseRepository,
                            ProductRepository productRepository) {
        this.inventoryRepository = inventoryRepository;
        this.stockLedgerRepository = stockLedgerRepository;
        this.warehouseRepository = warehouseRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<InventoryDto> searchInventory(Long warehouseId, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<Inventory> invPage = inventoryRepository.searchInventory(
                warehouseId,
                keyword != null && !keyword.trim().isEmpty() ? keyword.trim() : null,
                pageable
        );

        List<InventoryDto> dtos = new ArrayList<>();
        for (Inventory inv : invPage.getContent()) {
            dtos.add(mapToDto(inv));
        }

        return new PageResponse<>(
                dtos,
                invPage.getNumber(),
                invPage.getSize(),
                invPage.getTotalElements(),
                invPage.getTotalPages(),
                invPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public List<InventoryDto> getLowStockAlerts() {
        List<Inventory> list = inventoryRepository.findLowStockItems();
        List<InventoryDto> dtos = new ArrayList<>();
        for (Inventory inv : list) {
            dtos.add(mapToDto(inv));
        }
        return dtos;
    }

    @Transactional(readOnly = true)
    public PageResponse<StockLedgerDto> getStockLedger(Long warehouseId, Long productId, String transactionType, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<StockLedger> ledgerPage = stockLedgerRepository.searchLedger(warehouseId, productId, transactionType, pageable);

        List<StockLedgerDto> dtos = new ArrayList<>();
        for (StockLedger sl : ledgerPage.getContent()) {
            dtos.add(mapToLedgerDto(sl));
        }

        return new PageResponse<>(
                dtos,
                ledgerPage.getNumber(),
                ledgerPage.getSize(),
                ledgerPage.getTotalElements(),
                ledgerPage.getTotalPages(),
                ledgerPage.isLast()
        );
    }

    @Transactional
    public Inventory getOrCreateInventory(Long warehouseId, Long productId) {
        return inventoryRepository.findByWarehouseIdAndProductId(warehouseId, productId)
                .orElseGet(() -> {
                    Warehouse warehouse = warehouseRepository.findById(warehouseId)
                            .orElseThrow(() -> new ResourceNotFoundException("Kho", "id", warehouseId));
                    Product product = productRepository.findById(productId)
                            .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm", "id", productId));
                    Inventory newInv = new Inventory(warehouse, product, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
                    return inventoryRepository.save(newInv);
                });
    }

    @Transactional
    public void reserveStock(Long warehouseId, Long productId, BigDecimal quantity) {
        Inventory inv = getOrCreateInventory(warehouseId, productId);
        if (inv.getQuantityAvailable().compareTo(quantity) < 0) {
            throw new BusinessException(String.format("Tồn kho khả dụng của sản phẩm '%s' không đủ (Hiện có: %s, Yêu cầu: %s)",
                    inv.getProduct().getName(), inv.getQuantityAvailable(), quantity));
        }

        inv.setQuantityReserved(inv.getQuantityReserved().add(quantity));
        inv.setQuantityAvailable(inv.getQuantityOnHand().subtract(inv.getQuantityReserved()));
        inventoryRepository.save(inv);
    }

    @Transactional
    public void releaseReservedStock(Long warehouseId, Long productId, BigDecimal quantity) {
        Inventory inv = getOrCreateInventory(warehouseId, productId);
        BigDecimal newReserved = inv.getQuantityReserved().subtract(quantity);
        if (newReserved.compareTo(BigDecimal.ZERO) < 0) {
            newReserved = BigDecimal.ZERO;
        }
        inv.setQuantityReserved(newReserved);
        inv.setQuantityAvailable(inv.getQuantityOnHand().subtract(inv.getQuantityReserved()));
        inventoryRepository.save(inv);
    }

    @Transactional
    public void deductIssuedStock(Long warehouseId, Long productId, BigDecimal quantity,
                                 String refType, Long refId, String refCode, String note, String username) {
        Inventory inv = getOrCreateInventory(warehouseId, productId);

        inv.setQuantityOnHand(inv.getQuantityOnHand().subtract(quantity));
        BigDecimal newReserved = inv.getQuantityReserved().subtract(quantity);
        if (newReserved.compareTo(BigDecimal.ZERO) < 0) {
            newReserved = BigDecimal.ZERO;
        }
        inv.setQuantityReserved(newReserved);
        inv.setQuantityAvailable(inv.getQuantityOnHand().subtract(inv.getQuantityReserved()));
        inventoryRepository.save(inv);

        // Ghi Sổ cái kho (Stock Ledger)
        StockLedger ledger = new StockLedger();
        ledger.setWarehouse(inv.getWarehouse());
        ledger.setProduct(inv.getProduct());
        ledger.setReferenceType(refType);
        ledger.setReferenceId(refId);
        ledger.setReferenceCode(refCode);
        ledger.setTransactionType("OUT");
        ledger.setQuantity(quantity);
        ledger.setBalanceAfter(inv.getQuantityOnHand());
        ledger.setUnitCost(inv.getProduct().getStandardCost());
        ledger.setNotes(note);
        ledger.setCreatedBy(username != null ? username : "SYSTEM");
        stockLedgerRepository.save(ledger);
    }

    @Transactional
    public void addReceivedStock(Long warehouseId, Long productId, BigDecimal quantity, BigDecimal unitCost,
                                String refType, Long refId, String refCode, String note, String username) {
        Inventory inv = getOrCreateInventory(warehouseId, productId);

        inv.setQuantityOnHand(inv.getQuantityOnHand().add(quantity));
        inv.setQuantityAvailable(inv.getQuantityOnHand().subtract(inv.getQuantityReserved()));
        inventoryRepository.save(inv);

        // Ghi Sổ cái kho (Stock Ledger)
        StockLedger ledger = new StockLedger();
        ledger.setWarehouse(inv.getWarehouse());
        ledger.setProduct(inv.getProduct());
        ledger.setReferenceType(refType);
        ledger.setReferenceId(refId);
        ledger.setReferenceCode(refCode);
        ledger.setTransactionType("IN");
        ledger.setQuantity(quantity);
        ledger.setBalanceAfter(inv.getQuantityOnHand());
        ledger.setUnitCost(unitCost != null ? unitCost : inv.getProduct().getStandardCost());
        ledger.setNotes(note);
        ledger.setCreatedBy(username != null ? username : "SYSTEM");
        stockLedgerRepository.save(ledger);
    }

    @Transactional
    public void adjustStock(StockAdjustmentRequest request, String username) {
        if ("IN".equalsIgnoreCase(request.getTransactionType())) {
            addReceivedStock(request.getWarehouseId(), request.getProductId(), request.getQuantity(),
                    BigDecimal.ZERO, "ADJUSTMENT", null, "MANUAL-ADJUST", request.getNotes(), username);
        } else if ("OUT".equalsIgnoreCase(request.getTransactionType())) {
            Inventory inv = getOrCreateInventory(request.getWarehouseId(), request.getProductId());
            if (inv.getQuantityAvailable().compareTo(request.getQuantity()) < 0) {
                throw new BusinessException("Tồn kho không đủ để điều chỉnh giảm");
            }
            inv.setQuantityOnHand(inv.getQuantityOnHand().subtract(request.getQuantity()));
            inv.setQuantityAvailable(inv.getQuantityOnHand().subtract(inv.getQuantityReserved()));
            inventoryRepository.save(inv);

            StockLedger ledger = new StockLedger();
            ledger.setWarehouse(inv.getWarehouse());
            ledger.setProduct(inv.getProduct());
            ledger.setReferenceType("ADJUSTMENT");
            ledger.setReferenceCode("MANUAL-ADJUST");
            ledger.setTransactionType("OUT");
            ledger.setQuantity(request.getQuantity());
            ledger.setBalanceAfter(inv.getQuantityOnHand());
            ledger.setUnitCost(inv.getProduct().getStandardCost());
            ledger.setNotes(request.getNotes());
            ledger.setCreatedBy(username != null ? username : "SYSTEM");
            stockLedgerRepository.save(ledger);
        } else {
            throw new AppException(400, "Loại điều chỉnh không hợp lệ (chỉ chấp nhận IN hoặc OUT)");
        }
    }

    public InventoryDto mapToDto(Inventory inv) {
        InventoryDto dto = new InventoryDto();
        dto.setId(inv.getId());
        dto.setWarehouseId(inv.getWarehouse().getId());
        dto.setWarehouseCode(inv.getWarehouse().getCode());
        dto.setWarehouseName(inv.getWarehouse().getName());
        dto.setProductId(inv.getProduct().getId());
        dto.setProductSku(inv.getProduct().getSku());
        dto.setProductName(inv.getProduct().getName());
        dto.setProductUnit(inv.getProduct().getUnit());
        dto.setQuantityOnHand(inv.getQuantityOnHand());
        dto.setQuantityReserved(inv.getQuantityReserved());
        dto.setQuantityAvailable(inv.getQuantityAvailable());
        return dto;
    }

    public StockLedgerDto mapToLedgerDto(StockLedger sl) {
        StockLedgerDto dto = new StockLedgerDto();
        dto.setId(sl.getId());
        dto.setWarehouseId(sl.getWarehouse().getId());
        dto.setWarehouseCode(sl.getWarehouse().getCode());
        dto.setWarehouseName(sl.getWarehouse().getName());
        dto.setProductId(sl.getProduct().getId());
        dto.setProductSku(sl.getProduct().getSku());
        dto.setProductName(sl.getProduct().getName());
        dto.setReferenceType(sl.getReferenceType());
        dto.setReferenceId(sl.getReferenceId());
        dto.setReferenceCode(sl.getReferenceCode());
        dto.setTransactionType(sl.getTransactionType());
        dto.setQuantity(sl.getQuantity());
        dto.setBalanceAfter(sl.getBalanceAfter());
        dto.setUnitCost(sl.getUnitCost());
        dto.setNotes(sl.getNotes());
        dto.setCreatedAt(sl.getCreatedAt());
        dto.setCreatedBy(sl.getCreatedBy());
        return dto;
    }
}
