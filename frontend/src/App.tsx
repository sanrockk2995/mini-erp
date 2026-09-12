import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { Login } from './pages/auth/Login';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ProductListPage } from './pages/product/ProductListPage';
import { CategoryTreePage } from './pages/product/CategoryTreePage';
import { PriceListPage } from './pages/product/PriceListPage';
import { CustomerListPage } from './pages/customer/CustomerListPage';
import { CustomerGroupPage } from './pages/customer/CustomerGroupPage';
import { SalesOrderListPage } from './pages/sales/SalesOrderListPage';
import { SalesOrderCreatePage } from './pages/sales/SalesOrderCreatePage';
import { SupplierListPage } from './pages/supplier/SupplierListPage';
import { PurchaseOrderListPage } from './pages/purchase/PurchaseOrderListPage';
import { PurchaseOrderCreatePage } from './pages/purchase/PurchaseOrderCreatePage';
import { SupplierDebtPage } from './pages/purchase/SupplierDebtPage';
import { InventoryOverviewPage } from './pages/warehouse/InventoryOverviewPage';
import { GoodsReceiptPage } from './pages/warehouse/GoodsReceiptPage';
import { GoodsIssuePage } from './pages/warehouse/GoodsIssuePage';
import { StockLedgerPage } from './pages/warehouse/StockLedgerPage';
import { WarehouseListPage } from './pages/warehouse/WarehouseListPage';

export const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#059669',
          colorLink: '#059669',
          colorSuccess: '#10B981',
          colorWarning: '#D97706',
          colorError: '#DC2626',
          colorInfo: '#0284C7',
          colorTextBase: '#0F172A',
          colorBgBase: '#FFFFFF',
          colorBorder: '#E2E8F0',
          borderRadius: 6,
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          controlHeight: 38,
        },
        components: {
          Table: {
            headerBg: '#F8FAFC',
            headerColor: '#475569',
            headerSplitColor: '#E2E8F0',
            rowHoverBg: '#F8FAFC',
            borderColor: '#E2E8F0',
            padding: 12,
            paddingXS: 8,
          },
          Card: {
            headerBg: 'transparent',
            headerFontSize: 15,
            paddingLG: 20,
          },
          Button: {
            fontWeight: 600,
            borderRadius: 6,
          },
          Input: {
            activeBorderColor: '#059669',
            hoverBorderColor: '#10B981',
            borderRadius: 6,
          },
          Select: {
            optionSelectedBg: '#ECFDF5',
            borderRadius: 6,
          },
        },
      }}
    >
      <AntdApp>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="products" element={<ProductListPage />} />
                <Route path="categories" element={<CategoryTreePage />} />
                <Route path="price-lists" element={<PriceListPage />} />
                <Route path="customers" element={<CustomerListPage />} />
                <Route path="customer-groups" element={<CustomerGroupPage />} />
                <Route path="sales-orders" element={<SalesOrderListPage />} />
                <Route path="sales-orders/create" element={<SalesOrderCreatePage />} />
                <Route path="suppliers" element={<SupplierListPage />} />
                <Route path="purchase-orders" element={<PurchaseOrderListPage />} />
                <Route path="purchase-orders/create" element={<PurchaseOrderCreatePage />} />
                <Route path="supplier-debts" element={<SupplierDebtPage />} />
                <Route path="inventory" element={<InventoryOverviewPage />} />
                <Route path="goods-receipts" element={<GoodsReceiptPage />} />
                <Route path="goods-issues" element={<GoodsIssuePage />} />
                <Route path="stock-ledger" element={<StockLedgerPage />} />
                <Route path="warehouses" element={<WarehouseListPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
