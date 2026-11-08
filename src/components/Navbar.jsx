import React, { useState } from "react";
import { 
  Zap, 
  Truck, 
  Plus, 
  Database, 
  UserCheck, 
  Building2, 
  Flame, 
  ChevronDown,
  Menu,
  X,
  RotateCcw,
  Boxes,
  ClipboardCheck,
  ArrowRightLeft
} from "lucide-react";
import { useInventory } from "../context/InventoryContext";

export default function Navbar({ onOpenNewTransfer, onOpenFirebaseModal, activeTab, setActiveTab }) {
  const { 
    branches, 
    selectedLocation, 
    setSelectedLocation, 
    userRole, 
    setUserRole, 
    transfers, 
    firebaseStatus,
    resetToDemoData
  } = useInventory();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const pendingTransfersCount = transfers.filter((t) => t.status === "in_transit").length;

  return (
    <>
      <header className="bg-[#12161E] border-b border-[#252C38] text-slate-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hamburger button for mobile drawer */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden p-2 rounded-lg bg-[#181D26] border border-[#273142] text-slate-300 hover:text-white"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-950/40 border border-orange-400/40 shrink-0">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">VOLTFLOW</span>
                <span className="text-[10px] sm:text-xs uppercase tracking-widest px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded font-mono font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  CCC
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Electrical Site & Warehouse Hub</p>
            </div>
          </div>

          {/* Desktop Location Selector */}
          <div className="hidden lg:flex items-center gap-2 bg-[#1A202C] px-3 py-1.5 rounded-lg border border-[#2D3748]">
            <Building2 className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="text-xs text-slate-400">View:</span>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-2 max-w-[200px] truncate"
            >
              <option value="all" className="bg-[#1A202C] text-slate-200">All Locations</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-[#1A202C] text-slate-200">
                  {b.isMain ? `🏢 [MAIN] ${b.name}` : `📍 ${b.name}`}
                </option>
              ))}
            </select>
          </div>

          {/* Actions & Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Firebase Connection Pill (Desktop / Tablet) */}
            <button
              onClick={onOpenFirebaseModal}
              className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition font-medium ${
                firebaseStatus.isConfigured
                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/40"
                  : "bg-[#1E2532] text-amber-300 border-amber-500/30 hover:bg-[#252E3E]"
              }`}
              title="Configure Firebase"
            >
              <Flame className={`w-3.5 h-3.5 ${firebaseStatus.isConfigured ? "text-emerald-400 fill-emerald-400" : "text-amber-400"}`} />
              <span className="hidden md:inline">
                {firebaseStatus.isConfigured ? "Firebase Connected" : "Local Database"}
              </span>
            </button>

            {/* Quick Dispatch CTA Button (Orange) - Mobile Friendly */}
            <button
              onClick={onOpenNewTransfer}
              className="flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-md shadow-orange-950/50 transition-all transform active:scale-95 border border-orange-400/30 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden xs:inline">Dispatch</span>
              <span className="xs:hidden">Send</span>
              {pendingTransfersCount > 0 && (
                <span className="bg-black/40 text-orange-200 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {pendingTransfersCount}
                </span>
              )}
            </button>

            {/* Role Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 bg-[#1A202C] hover:bg-[#232B3B] border border-[#2D3748] p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs transition cursor-pointer"
                title="Current User Role"
              >
                <div className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs border border-orange-500/40 shrink-0">
                  {userRole.name.charAt(0)}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="font-semibold text-slate-200 leading-none">{userRole.name}</p>
                  <p className="text-[10px] text-orange-400 leading-none mt-0.5">{userRole.role}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#181D26] border border-[#2E3747] rounded-xl shadow-2xl p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                  <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 px-2 py-1 font-semibold">
                    Switch Active Role
                  </p>
                  <button
                    onClick={() => {
                      setUserRole({
                        id: "admin",
                        name: "Engr. Rafiqul Islam",
                        role: "Central Warehouse Head",
                        locationId: "loc_main"
                      });
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2 py-2 rounded-lg flex items-center gap-2.5 transition ${
                      userRole.locationId === "loc_main" ? "bg-orange-600/20 text-orange-300 font-semibold" : "hover:bg-[#222A38] text-slate-300"
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-orange-400 shrink-0" />
                    <div>
                      <div className="text-white">Engr. Rafiqul Islam</div>
                      <div className="text-[10px] text-slate-400">Main Warehouse Lead</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setUserRole({
                        id: "site_lead_1",
                        name: "Supervisor Tanvir Ahmed",
                        role: "Mirpur Site In-Charge",
                        locationId: "loc_site_1"
                      });
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2 py-2 rounded-lg flex items-center gap-2.5 transition mt-1 ${
                      userRole.locationId === "loc_site_1" ? "bg-orange-600/20 text-orange-300 font-semibold" : "hover:bg-[#222A38] text-slate-300"
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-white">Tanvir Ahmed</div>
                      <div className="text-[10px] text-slate-400">Site In-Charge (Receives Goods)</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Slide-over Mobile Drawer Navigation */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-in fade-in"
          ></div>

          {/* Drawer Panel */}
          <div className="relative w-4/5 max-w-xs bg-[#12161E] border-r border-[#262F3E] p-5 flex flex-col justify-between h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#232B3B] mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold">
                    ⚡
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">VOLTFLOW CCC</h3>
                    <p className="text-[10px] text-slate-400">Mobile Control Center</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-[#1A202C] text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Location Selector */}
              <div className="mb-4">
                <label className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1">
                  Filter by Location:
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full bg-[#181D26] border border-[#273142] text-xs text-white p-2.5 rounded-xl focus:outline-none"
                >
                  <option value="all">🏢 All Locations (Total)</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.isMain ? `[MAIN] ${b.name}` : `📍 ${b.name}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Navigation Links */}
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold mb-2">
                Navigation
              </div>
              <nav className="space-y-1">
                {[
                  { id: "dashboard", label: "Dashboard", icon: Zap },
                  { 
                    id: "transfers", 
                    label: "Stock Transfers & Challans", 
                    icon: ArrowRightLeft,
                    badge: pendingTransfersCount > 0 ? `${pendingTransfersCount} In-Transit` : null
                  },
                  { id: "inventory", label: "Stock Inventory", icon: Boxes },
                  { id: "usage", label: "Site Usage & Work Notes", icon: ClipboardCheck },
                  { id: "branches", label: "Project Sites Directory", icon: Building2 },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileDrawerOpen(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive
                          ? "bg-orange-600/20 text-orange-400 border border-orange-500/30"
                          : "text-slate-300 hover:bg-[#1A202C]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-orange-400" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-orange-500/20 text-orange-400 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* System Options */}
              <div className="mt-6 pt-4 border-t border-[#232B3B] space-y-2">
                <button
                  onClick={() => {
                    onOpenFirebaseModal();
                    setMobileDrawerOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#181D26] border border-[#273142] text-xs text-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span>Firebase Cloud DB</span>
                  </div>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    firebaseStatus.isConfigured ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-300"
                  }`}>
                    {firebaseStatus.isConfigured ? "Connected" : "Local"}
                  </span>
                </button>
              </div>

            </div>

            {/* Reset Button */}
            <div className="pt-4 border-t border-[#232B3B]">
              <button
                onClick={() => {
                  if (confirm("Reset to demo data?")) {
                    resetToDemoData();
                    setMobileDrawerOpen(false);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-orange-400 py-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
