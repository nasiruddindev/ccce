import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { InventoryProvider } from "./context/InventoryContext";
import { ToastProvider } from "./context/ToastContext";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Eager Authentication Route
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";

// Lazy Loaded Operational Pages for Optimal Bundle Splitting & Fast First Paint
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Categories = lazy(() => import("./pages/Categories"));
const AllBranches = lazy(() => import("./pages/AllBranches"));
const BranchDetails = lazy(() => import("./pages/BranchDetails"));
const BranchInventory = lazy(() => import("./pages/BranchInventory"));
const StockTransfer = lazy(() => import("./pages/StockTransfer"));
const TransferHistory = lazy(() => import("./pages/TransferHistory"));
const StockMovementHistory = lazy(() => import("./pages/StockMovementHistory"));
const LowStock = lazy(() => import("./pages/LowStock"));
const Users = lazy(() => import("./pages/Users"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));

// Production Loading Fallback Component
function PageLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-3 border-blue-600/20 border-t-blue-600 animate-spin" />
      <span className="text-xs font-semibold text-slate-500">Loading station module...</span>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <InventoryProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
          </BrowserRouter>
        </InventoryProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
