"use client";

import React, { useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./Dashboard";
import AdminProducts from "./Products";
import AddProduct from "./AddProduct";
import EditProduct from "./EditProduct";
import AdminOrders from "./Orders";
import AdminCustomers from "./Customers";
import CategoryFeatures from "./CategoryFeatures";
import CompanySettings from "./CompanySettings";
import HeroSettings from "./HeroSettings";
import FooterSettings from "./FooterSettings";
import AdminMessages from "./Messages";
import POS from "./POS";
import POSHistory from "./POSHistory";
import Brands from "./Brands";
import UserActivity from "./UserActivity";
import UserActivityDetail from "./UserActivityDetail";
import Repairs from "./Repairs";
import ServiceCategories from "./ServiceCategories";
import ServiceCategoryForm from "./ServiceCategoryForm";
import ServiceCenterSettings from "./ServiceCenterSettings";
import ServiceSubmissions from "./ServiceSubmissions";
import ServiceTickets from "./ServiceTickets";
import ServiceTicketDetail from "./ServiceTicketDetail";
import RepairProducts from "./pages/RepairProducts";
import RepairProductForm from "./pages/RepairProductForm";

// Order Sub-routes
import NewOrders from "./orders/NewOrders";
import PendingOrders from "./orders/PendingOrders";
import ProcessingOrders from "./orders/ProcessingOrders";
import ShippedOrders from "./orders/ShippedOrders";
import DeliveredOrders from "./orders/DeliveredOrders";
import ProcessConformOrders from "./orders/ProcessConformOrders";
import CancelledOrders from "./orders/CancelledOrders";
import ProcessDontConformOrders from "./orders/ProcessDontConformOrders";

// Reports Sub-routes
import CustomerReports from "./reports/CustomerReports";
import SalesReport from "./reports/SalesReport";
import SalesProductReport from "./reports/SalesProductReport";
import SalesCategoryReport from "./reports/SalesCategoryReport";
import OutOfStockReport from "./reports/OutOfStockReport";
import SalesBrandReport from "./reports/SalesBrandReport";
import CountryOrderReport from "./reports/CountryOrderReport";
import OrderStatusReport from "./reports/OrderStatusReport";
import TopSalesReports from "./reports/TopSalesReports";
import StockReport from "./reports/StockReport";

// Staff Sub-routes
import Roles from "./staff/Roles";
import Users from "./staff/Users";

export default function AdminApp() {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30000,
          },
        },
      }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="luma-admin-theme">
        <AuthProvider>
          <Toaster richColors position="top-right" />
          <BrowserRouter>
            <Routes>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/add" element={<AddProduct />} />
                <Route path="products/edit/:id" element={<EditProduct />} />
                <Route path="categories" element={<CategoryFeatures />} />
                <Route path="category-features" element={<CategoryFeatures />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/new" element={<NewOrders />} />
                <Route path="orders/pending" element={<PendingOrders />} />
                <Route path="orders/processing" element={<ProcessingOrders />} />
                <Route path="orders/shipped" element={<ShippedOrders />} />
                <Route path="orders/delivered" element={<DeliveredOrders />} />
                <Route path="orders/process-conform" element={<ProcessConformOrders />} />
                <Route path="orders/cancelled" element={<CancelledOrders />} />
                <Route path="orders/process-dont-conform" element={<ProcessDontConformOrders />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="pos" element={<POS />} />
                <Route path="pos/history" element={<POSHistory />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="brands" element={<Brands />} />
                <Route path="company-settings" element={<CompanySettings />} />
                <Route path="hero-settings" element={<HeroSettings />} />
                <Route path="footer" element={<FooterSettings />} />
                <Route path="activity" element={<UserActivity />} />
                <Route path="activity/:id" element={<UserActivityDetail />} />
                <Route path="activity/user/:id" element={<UserActivityDetail />} />
                <Route path="repairs" element={<Repairs />} />
                <Route path="service-submissions" element={<ServiceSubmissions />} />
                <Route path="service-submissions/new" element={<ServiceSubmissions title="New Requests" defaultStatus="new" />} />
                <Route path="service-submissions/active" element={<ServiceSubmissions title="Repair Process" defaultStatus="active" />} />
                <Route path="service-submissions/done" element={<ServiceSubmissions title="Completed" defaultStatus="done" />} />
                <Route path="service-submissions/rejected" element={<ServiceSubmissions title="Rejected" defaultStatus="rejected" />} />
                <Route path="service-config" element={<Navigate to="/admin/service-categories" replace />} />
                <Route path="service-categories" element={<ServiceCategories />} />
                <Route path="service-categories/add" element={<ServiceCategoryForm />} />
                <Route path="service-center-settings" element={<ServiceCenterSettings />} />
                <Route path="service-tickets" element={<ServiceTickets />} />
                <Route path="service-tickets/:id" element={<ServiceTicketDetail />} />
                <Route path="repair-products" element={<RepairProducts />} />
                <Route path="repair-products/add" element={<RepairProductForm />} />
                <Route path="repair-products/:id/edit" element={<RepairProductForm />} />
                <Route path="staff/roles" element={<Roles />} />
                <Route path="staff/users" element={<Users />} />
                <Route path="reports" element={<Navigate to="/admin/reports/customers" replace />} />
                <Route path="reports/orders" element={<Navigate to="/admin/reports/orders/sales" replace />} />
                <Route path="reports/customers" element={<CustomerReports />} />
                <Route path="reports/orders/sales" element={<SalesReport />} />
                <Route path="reports/orders/products" element={<SalesProductReport />} />
                <Route path="reports/orders/categories" element={<SalesCategoryReport />} />
                <Route path="reports/orders/out-of-stock" element={<OutOfStockReport />} />
                <Route path="reports/orders/brands" element={<SalesBrandReport />} />
                <Route path="reports/orders/countries" element={<CountryOrderReport />} />
                <Route path="reports/orders/status" element={<OrderStatusReport />} />
                <Route path="reports/top-sales" element={<TopSalesReports />} />
                <Route path="reports/stock" element={<StockReport />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
