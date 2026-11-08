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
  ShieldAlert
} from "lucide-react";
import { useInventory } from "../context/InventoryContext";

export default function Navbar({ onOpenNewTransfer, onOpenFirebaseModal }) {
  const { 
    branches, 
    selectedLocation, 
    setSelectedLocation, 
    userRole, 
    setUserRole, 
    transfers, 
    firebaseStatus 
  } = useInventory();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const pendingTransfersCount = transfers.filter((t) => t.status === "in_transit").length;

  const currentBranch = branches.find((b) => b.id === selectedLocation) || {
    name: "All Branches & Warehouses"
  };

  return (
    <header className="bg-[#12161E] border-b border-[#252C38] text-slate-100 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Logo & Company Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-950/40 border border-orange-400/40">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">VOLTFLOW</span>
              <span className="text-xs uppercase tracking-widest px-1.5 py-0.5 rounded font-mono font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                CCC
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Electrical Site & Warehouse Dispatch</p>
          </div>
        </div>

        {/* Global Location Selector */}
        <div className="hidden md:flex items-center gap-2 bg-[#1A202C] px-3 py-1.5 rounded-lg border border-[#2D3748]">
          <Building2 className="w-4 h-4 text-orange-400" />
          <span className="text-xs text-slate-400">View:</span>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-2"
          >
            <option value="all" className="bg-[#1A202C] text-slate-200">All Locations (Consolidated)</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id} className="bg-[#1A202C] text-slate-200">
                {b.isMain ? `🏢 [MAIN] ${b.name}` : `📍 ${b.name}`}
              </option>
            ))}
          </select>
        </div>

        {/* Actions & Role Switcher */}
        <div className="flex items-center gap-3">
          
          {/* Firebase Connection Pill */}
          <button
            onClick={onOpenFirebaseModal}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition font-medium ${
              firebaseStatus.isConfigured
                ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/40"
                : "bg-[#1E2532] text-amber-300 border-amber-500/30 hover:bg-[#252E3E]"
            }`}
            title="Configure or test Firebase connection"
          >
            <Flame className={`w-3.5 h-3.5 ${firebaseStatus.isConfigured ? "text-emerald-400 fill-emerald-400" : "text-amber-400"}`} />
            <span className="hidden sm:inline">
              {firebaseStatus.isConfigured ? "Firebase Connected" : "Local Database"}
            </span>
          </button>

          {/* Quick Transfer CTA Button (Orange) */}
          <button
            onClick={onOpenNewTransfer}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg shadow-md shadow-orange-950/50 transition-all transform active:scale-95 border border-orange-400/30 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Dispatch</span>
            {pendingTransfersCount > 0 && (
              <span className="bg-black/40 text-orange-200 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold">
                {pendingTransfersCount} In-Transit
              </span>
            )}
          </button>

          {/* Role Switcher (Simulate Warehouse Lead vs Site In-charge) */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 bg-[#1A202C] hover:bg-[#232B3B] border border-[#2D3748] px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs border border-orange-500/40">
                {userRole.name.charAt(0)}
              </div>
              <div className="text-left hidden lg:block">
                <p className="font-semibold text-slate-200 leading-none">{userRole.name}</p>
                <p className="text-[10px] text-orange-400 leading-none mt-0.5">{userRole.role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#181D26] border border-[#2E3747] rounded-xl shadow-2xl p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 px-2 py-1 font-semibold">
                  Switch Active Role (Demo)
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
                  <Building2 className="w-4 h-4 text-orange-400" />
                  <div>
                    <div className="text-white">Engr. Rafiqul Islam</div>
                    <div className="text-[10px] text-slate-400">Main Warehouse (Dispatches goods)</div>
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
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-white">Tanvir Ahmed (Site In-Charge)</div>
                    <div className="text-[10px] text-slate-400">Mirpur Site (Receives & Confirms goods)</div>
                  </div>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
