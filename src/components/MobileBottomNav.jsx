import React from "react";
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  Boxes, 
  ClipboardCheck, 
  Building2 
} from "lucide-react";
import { useInventory } from "../context/InventoryContext";

export default function MobileBottomNav({ activeTab, setActiveTab }) {
  const { transfers } = useInventory();
  const inTransitCount = transfers.filter((t) => t.status === "in_transit").length;

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { 
      id: "transfers", 
      label: "Dispatches", 
      icon: ArrowRightLeft,
      badge: inTransitCount > 0 ? inTransitCount : null
    },
    { id: "inventory", label: "Stock", icon: Boxes },
    { id: "usage", label: "Site Usage", icon: ClipboardCheck },
    { id: "branches", label: "Sites", icon: Building2 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#12161E]/95 backdrop-blur-md border-t border-[#252C38] px-2 py-1 flex items-center justify-around safe-area-bottom">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`flex flex-col items-center justify-center py-1 px-2 min-w-[56px] relative transition-all cursor-pointer ${
              isActive ? "text-orange-400 font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? "text-orange-400 stroke-[2.5]" : "text-slate-400"}`} />
              {tab.badge && (
                <span className="absolute -top-1.5 -right-2.5 bg-orange-500 text-white text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-md animate-pulse">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-orange-500 mt-0.5"></span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
