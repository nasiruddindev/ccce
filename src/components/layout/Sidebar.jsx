import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ArrowRightLeft,
  Building2,
  Users,
  BarChart3,
  Settings,
  User,
  History,
  AlertTriangle,
  Zap,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  X,
  LogOut,
  Shield
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useInventory } from "../../context/InventoryContext";

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const { userRole, userProfile, isAdmin, logout } = useAuth();
  const { transfers, lowStockCount } = useInventory();
  const navigate = useNavigate();

  const inTransitCount = transfers.filter((t) => t.status === "in_transit").length;

  // Admin Navigation Items
  const adminNav = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Products", path: "/products", icon: Package },
    { name: "Categories", path: "/categories", icon: Layers },
    { name: "Inventory", path: "/branch-inventory", icon: Boxes },
    { name: "Stock Transfer", path: "/stock-transfer", icon: ArrowRightLeft, badge: inTransitCount > 0 ? `${inTransitCount} In-Transit` : null, badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    { name: "Branches", path: "/branches", icon: Building2 },
    { name: "Users", path: "/users", icon: Users },
    { name: "Reports", path: "/reports", icon: BarChart3 },
    { name: "Settings", path: "/settings", icon: Settings }
  ];

  // Branch Engineer Navigation Items
  const engineerNav = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Products", path: "/products", icon: Package },
    { name: "Global Inventory", path: "/branch-inventory", icon: Boxes },
    { name: "Stock Transfer", path: "/stock-transfer", icon: ArrowRightLeft },
    { name: "Transfer History", path: "/transfer-history", icon: History, badge: inTransitCount > 0 ? `${inTransitCount}` : null },
    { name: "Reports", path: "/reports", icon: BarChart3 },
    { name: "Profile", path: "/profile", icon: User }
  ];

  // Secondary operational logs for Admin
  const secondaryNav = [
    { name: "Transfer History", path: "/transfer-history", icon: History },
    { name: "Stock Movements", path: "/stock-movements", icon: TrendingUp },
    { name: "Low Stock Alerts", path: "/low-stock", icon: AlertTriangle, badge: lowStockCount > 0 ? `${lowStockCount}` : null, badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30" }
  ];

  const primaryItems = isAdmin ? adminNav : engineerNav;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-300 border-r border-slate-800/80 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 shrink-0">
        <NavLink to="/" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-900/40 shrink-0">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-white text-base tracking-tight leading-tight">
                VoltFlow
              </span>
              <span className="text-[10px] text-blue-400 font-medium tracking-wide uppercase">
                Grid Substation CCC
              </span>
            </div>
          )}
        </NavLink>

        {/* Desktop Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Verified Role Badge */}
      {!isCollapsed ? (
        <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
              Authenticated
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isAdmin
                  ? "bg-blue-950/80 text-blue-400 border-blue-800/60"
                  : "bg-emerald-950/80 text-emerald-400 border-emerald-800/60"
              }`}
            >
              {userRole}
            </span>
          </div>
        </div>
      ) : null}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          {!isCollapsed && (
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Main Operations
            </p>
          )}
          <nav className="space-y-1">
            {primaryItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                      isActive
                        ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/30"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                    } ${isCollapsed ? "justify-center" : "justify-between"}`
                  }
                  title={isCollapsed ? item.name : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                        item.badgeColor || "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Additional Operational Views for Admin */}
        {isAdmin && (
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Audit & Logistics
              </p>
            )}
            <nav className="space-y-1">
              {secondaryNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                        isActive
                          ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/30"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                      } ${isCollapsed ? "justify-center" : "justify-between"}`
                    }
                    title={isCollapsed ? item.name : undefined}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </div>
                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                          item.badgeColor || "bg-slate-800 text-slate-300 border-slate-700"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* User Session & Logout at bottom */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 shrink-0">
        {!isCollapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs ring-2 ring-blue-500/40 shrink-0">
                {userProfile?.fullName?.[0] || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{userProfile?.fullName || "Authenticated Staff"}</p>
                <p className="text-[10px] text-slate-400 truncate">{userProfile?.branchName || "Assigned Station"}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700/80 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-300 ease-in-out fixed top-0 bottom-0 left-0 z-30 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <div
        className={`lg:hidden fixed top-0 bottom-0 left-0 w-72 z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
