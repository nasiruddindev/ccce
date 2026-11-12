import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  Building2,
  ChevronDown,
  User,
  Shield,
  Settings,
  LogOut,
  AlertTriangle,
  Info,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useInventory } from "../../context/InventoryContext";

export default function Navbar({ isCollapsed, onOpenMobileSidebar }) {
  const { userProfile, userRole, isAdmin, logout } = useAuth();
  const {
    branches,
    selectedBranchId,
    setSelectedBranchId,
    notifications,
    setNotifications,
    globalSearch,
    setGlobalSearch
  } = useInventory();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200/90 shadow-2xs h-16">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left Side: Mobile Menu Button & Search Bar */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar */}
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search products, SKUs, challans, substations..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        {/* Right Side: Branch Filter, Role Badge, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Branch Filter Selector */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-slate-500 font-medium">Station:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer max-w-[140px] truncate"
            >
              <option value="all">All Substations</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.isMain ? `🏢 ${b.name}` : `⚡ ${b.name}`}
                </option>
              ))}
            </select>
          </div>

          {/* Verified Role Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70 text-blue-800 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>{userRole}</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-0 z-50 animate-in fade-in-50 zoom-in-95 duration-150 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 hover:bg-slate-50 transition flex items-start gap-3 ${
                        item.unread ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {item.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        {item.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {item.type === "info" && <Info className="w-4 h-4 text-blue-500" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900">{item.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{item.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                  <Link
                    to="/low-stock"
                    onClick={() => setNotificationsOpen(false)}
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    View all substation alerts &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 sm:pr-2.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-blue-500/30">
                {userProfile?.fullName?.[0] || "U"}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {userProfile?.fullName || "Staff Member"}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {userRole}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                <div className="px-3 py-2.5 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center ring-2 ring-blue-500/20 shrink-0">
                    {userProfile?.fullName?.[0] || "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {userProfile?.fullName || "Authenticated Staff"}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{userProfile?.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                      {userProfile?.branchName || "Assigned Substation"}
                    </span>
                  </div>
                </div>

                <div className="py-1 space-y-0.5">
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Enterprise Settings</span>
                    </Link>
                  )}
                </div>

                <div className="pt-1 mt-1 border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
