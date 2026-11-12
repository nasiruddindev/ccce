import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Breadcrumbs from "./Breadcrumbs";

export default function AppLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Sidebar (Desktop fixed & Mobile drawer) */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Page Wrapper */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* Top Navbar */}
        <Navbar
          isCollapsed={isCollapsed}
          onOpenMobileSidebar={() => setIsMobileOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Breadcrumbs */}
          <Breadcrumbs />

          {/* Page Routed Content */}
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 bg-white">
          <p>
            VoltFlow Enterprise Multi-Branch Inventory Management &bull; Phase 1 UI Design &bull; Designed for Electrical CCC Industries
          </p>
        </footer>
      </div>
    </div>
  );
}
