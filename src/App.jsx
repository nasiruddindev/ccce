import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { InventoryProvider } from "./context/InventoryContext";
import { ToastProvider } from "./context/ToastContext";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Authentication & Access Pages
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";

// 15 Operational Pages
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Categories from "./pages/Categories";
import AllBranches from "./pages/AllBranches";
import BranchDetails from "./pages/BranchDetails";
import BranchInventory from "./pages/BranchInventory";
import StockTransfer from "./pages/StockTransfer";
import TransferHistory from "./pages/TransferHistory";
import StockMovementHistory from "./pages/StockMovementHistory";
import LowStock from "./pages/LowStock";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <InventoryProvider>
          <BrowserRouter>
          <Routes>
            {/* Public Authentication Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Enterprise SaaS Application */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Common Accessible Routes (Main Admin & Branch Engineer) */}
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:id" element={<ProductDetails />} />
              <Route path="branch-inventory" element={<BranchInventory />} />
              <Route path="stock-transfer" element={<StockTransfer />} />
              <Route path="transfer-history" element={<TransferHistory />} />
              <Route path="stock-movements" element={<StockMovementHistory />} />
              <Route path="low-stock" element={<LowStock />} />
              <Route path="reports" element={<Reports />} />
              <Route path="profile" element={<Profile />} />
              <Route path="branches/:id" element={<BranchDetails />} />
              <Route path="unauthorized" element={<Unauthorized />} />

              {/* Administrative Only Protected Routes (Main Admin) */}
              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={["Main Admin"]}>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <ProtectedRoute allowedRoles={["Main Admin"]}>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="categories"
                element={
                  <ProtectedRoute allowedRoles={["Main Admin"]}>
                    <Categories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="branches"
                element={
                  <ProtectedRoute allowedRoles={["Main Admin"]}>
                    <AllBranches />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </InventoryProvider>
    </AuthProvider>
  </ToastProvider>
  );
}
