package com.erp.modules.dashboard.service;

import com.erp.modules.customer.repository.CustomerRepository;
import com.erp.modules.dashboard.dto.DashboardStatsDto;
import com.erp.modules.dashboard.dto.MonthlySalesDto;
import com.erp.modules.dashboard.dto.TopProductDto;
import com.erp.modules.product.repository.ProductRepository;
import com.erp.modules.purchase.repository.SupplierDebtRepository;
import com.erp.modules.supplier.repository.SupplierRepository;
import com.erp.modules.warehouse.repository.InventoryRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardService {

    @PersistenceContext
    private EntityManager entityManager;

    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryRepository inventoryRepository;
    private final SupplierDebtRepository supplierDebtRepository;

    public DashboardService(ProductRepository productRepository,
                            CustomerRepository customerRepository,
                            SupplierRepository supplierRepository,
                            InventoryRepository inventoryRepository,
                            SupplierDebtRepository supplierDebtRepository) {
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.supplierRepository = supplierRepository;
        this.inventoryRepository = inventoryRepository;
        this.supplierDebtRepository = supplierDebtRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getStats() {
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate endOfMonth = startOfMonth.plusMonths(1).minusDays(1);

        // Doanh thu tháng này
        BigDecimal monthlyRev = (BigDecimal) entityManager.createNativeQuery(
                "SELECT COALESCE(SUM(total_amount), 0) FROM sales_orders " +
                "WHERE order_date BETWEEN :start AND :end AND status IN ('APPROVED', 'DELIVERING', 'COMPLETED')")
                .setParameter("start", startOfMonth)
                .setParameter("end", endOfMonth)
                .getSingleResult();

        // Số đơn hàng tháng này
        Number monthlyOrders = (Number) entityManager.createNativeQuery(
                "SELECT COUNT(id) FROM sales_orders WHERE order_date BETWEEN :start AND :end")
                .setParameter("start", startOfMonth)
                .setParameter("end", endOfMonth)
                .getSingleResult();

        // Số đơn chờ duyệt (DRAFT)
        Number pendingOrders = (Number) entityManager.createNativeQuery(
                "SELECT COUNT(id) FROM sales_orders WHERE status = 'DRAFT'")
                .getSingleResult();

        // Số sản phẩm cảnh báo tồn kho thấp
        Number lowStock = (Number) entityManager.createNativeQuery(
                "SELECT COUNT(id) FROM inventory WHERE quantity_on_hand <= 10")
                .getSingleResult();

        // Tổng công nợ nhà cung cấp
        BigDecimal totalDebt = supplierDebtRepository.getTotalSystemRemainingDebt();
        if (totalDebt == null) totalDebt = BigDecimal.ZERO;

        DashboardStatsDto stats = new DashboardStatsDto();
        stats.setTotalMonthlyRevenue(monthlyRev != null ? monthlyRev : BigDecimal.ZERO);
        stats.setTotalOrdersThisMonth(monthlyOrders != null ? monthlyOrders.longValue() : 0);
        stats.setPendingOrdersCount(pendingOrders != null ? pendingOrders.longValue() : 0);
        stats.setLowStockCount(lowStock != null ? lowStock.longValue() : 0);
        stats.setTotalSupplierDebt(totalDebt);
        stats.setTotalProductsCount(productRepository.count());
        stats.setTotalCustomersCount(customerRepository.count());
        stats.setTotalSuppliersCount(supplierRepository.count());

        return stats;
    }

    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<MonthlySalesDto> getSalesTrend() {
        // Lấy 6 tháng gần nhất
        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(5).withDayOfMonth(1);

        List<Object[]> rows = entityManager.createNativeQuery(
                "SELECT DATE_FORMAT(order_date, '%Y-%m') as ym, " +
                "COALESCE(SUM(total_amount), 0) as rev, " +
                "COUNT(id) as cnt " +
                "FROM sales_orders " +
                "WHERE order_date >= :since AND status IN ('APPROVED', 'DELIVERING', 'COMPLETED') " +
                "GROUP BY DATE_FORMAT(order_date, '%Y-%m') " +
                "ORDER BY ym ASC")
                .setParameter("since", sixMonthsAgo)
                .getResultList();

        List<MonthlySalesDto> list = new ArrayList<>();
        for (Object[] r : rows) {
            String month = (String) r[0];
            BigDecimal rev = new BigDecimal(r[1].toString());
            long cnt = ((Number) r[2]).longValue();
            list.add(new MonthlySalesDto(month, rev, cnt));
        }

        // Nếu ít hơn 6 tháng, bổ sung các tháng còn thiếu với doanh thu 0
        if (list.isEmpty()) {
            for (int i = 5; i >= 0; i--) {
                String ym = LocalDate.now().minusMonths(i).format(DateTimeFormatter.ofPattern("yyyy-MM"));
                list.add(new MonthlySalesDto(ym, BigDecimal.ZERO, 0L));
            }
        }

        return list;
    }

    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<TopProductDto> getTopProducts() {
        List<Object[]> rows = entityManager.createNativeQuery(
                "SELECT p.id, p.sku, p.name, " +
                "COALESCE(SUM(soi.quantity), 0) as total_qty, " +
                "COALESCE(SUM(soi.line_total), 0) as total_rev " +
                "FROM sales_order_items soi " +
                "JOIN products p ON soi.product_id = p.id " +
                "JOIN sales_orders so ON soi.sales_order_id = so.id " +
                "WHERE so.status IN ('APPROVED', 'DELIVERING', 'COMPLETED') " +
                "GROUP BY p.id, p.sku, p.name " +
                "ORDER BY total_rev DESC " +
                "LIMIT 5")
                .getResultList();

        List<TopProductDto> list = new ArrayList<>();
        for (Object[] r : rows) {
            Long pid = ((Number) r[0]).longValue();
            String sku = (String) r[1];
            String name = (String) r[2];
            BigDecimal qty = new BigDecimal(r[3].toString());
            BigDecimal rev = new BigDecimal(r[4].toString());
            list.add(new TopProductDto(pid, sku, name, qty, rev));
        }

        return list;
    }
}
