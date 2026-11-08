import React from "react";
import { 
  LayoutDashboard, 
  Truck, 
  Boxes, 
  ClipboardCheck, 
  Building2, 
  Flame, 
  RotateCcw,
  Sparkles,
  ArrowRightLeft
} from "lucide-react";
import { useInventory } from "../context/InventoryContext";

export default function Sidebar({ activeTab, setActiveTab, onOpenFirebaseModal }) {
  const { transfers, resetToDemoData } = useInventory();

  const inTransitCount = transfers.filter((t) => t.status === "in_transit").length;

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: "transfers",
      label: "Stock Transfers & Challans",
      icon: ArrowRightLeft,
      badge: inTransitCount > 0 ? `${inTransitCount} In-Transit` : null,
      badgeColor: "bg-orange-500/20 text-orange-400 border border-orange-500/40 animate-pulse"
    },
    {
      id: "inventory",
      label: "Stock Inventory",
      icon: Boxes,
      badge: null
    },
    {
      id: "usage",
      label: "Site Usage & Consumption",
      icon: ClipboardCheck,
      badge: null
    },
    {
      id: "branches",
      label: "Warehouses & Project Sites",
      icon: Building2,
      badge: null
    }
  ];

  return (
    <aside className="hidden md:flex md:w-64 shrink-0 bg-[#12161E] border-r border-[#222936] flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div>
        <div className="text-[11px] uppercase tracking-wider font-mono text-slate-400 font-bold px-3 mb-2">
          Operations
        </div>
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#1E2532] text-white border-l-4 border-l-orange-500 border border-orange-500/20 shadow-md shadow-orange-950/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#181D26]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-orange-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${item.badgeColor || "bg-[#252E3E] text-slate-300"}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Database & System Info */}
        <div className="mt-8">
          <div className="text-[11px] uppercase tracking-wider font-mono text-slate-400 font-bold px-3 mb-2">
            System & Database
          </div>
          <button
            onClick={onOpenFirebaseModal}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-300 hover:bg-[#1A202C] border border-[#252C38] transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>Firebase Cloud DB</span>
            </div>
            <span className="text-[10px] text-orange-400 font-mono font-semibold">Config</span>
          </button>
        </div>
      </div>

      {/* Footer Helper / Reset */}
      <div className="pt-4 border-t border-[#222936] space-y-3">
        <div className="bg-[#181D26] p-3 rounded-xl border border-[#252D3B]">
          <p className="text-[11px] text-slate-400">
            <span className="text-orange-400 font-semibold">Tip:</span> Dispatch items from Main Warehouse and confirm receipt at any branch.
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm("Reset all inventory, branches and transfers to demo data?")) {
              resetToDemoData();
            }
          }}
          className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-orange-400 py-1.5 transition cursor-pointer"
          title="Reset to default mock data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Demo Data</span>
        </button>
      </div>
    </aside>
  );
}
