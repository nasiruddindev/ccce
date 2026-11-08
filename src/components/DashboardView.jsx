import React from "react";
import { 
  Boxes, 
  Truck, 
  AlertTriangle, 
  Building2, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Plus, 
  FileText,
  PackageCheck,
  Wrench,
  ClipboardCheck
} from "lucide-react";
import { useInventory } from "../context/InventoryContext";

export default function DashboardView({ 
  onOpenNewTransfer, 
  onOpenAddProduct, 
  onViewChallan,
  onOpenRecordUsage,
  setActiveTab 
}) {
  const { 
    products, 
    transfers, 
    branches, 
    siteUsages,
    confirmReceiveTransfer,
    userRole
  } = useInventory();

  // Calculations
  const inTransitTransfers = transfers.filter((t) => t.status === "in_transit");
  const receivedTransfers = transfers.filter((t) => t.status === "received");

  const totalStockUnits = products.reduce((acc, prod) => {
    const sumForProduct = Object.values(prod.stock || {}).reduce((s, q) => s + Number(q || 0), 0);
    return acc + sumForProduct;
  }, 0);

  const mainWarehouseStock = products.reduce((acc, prod) => {
    return acc + Number(prod.stock?.loc_main || 0);
  }, 0);

  const lowStockItems = products.filter((prod) => {
    const mainQty = prod.stock?.loc_main || 0;
    return mainQty <= prod.minAlertLevel;
  });

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-6">
      
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-[#171C24] via-[#1B222D] to-[#171C24] p-4 sm:p-6 rounded-2xl border border-[#262F3E] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="text-[10px] sm:text-xs uppercase font-mono tracking-wider text-orange-400 font-semibold">
              Mobile Site & Warehouse Hub
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            VoltFlow CCC Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 max-w-2xl">
            Track material dispatches and manage site consumption on mobile.
          </p>
        </div>

        {/* Action Buttons for Mobile */}
        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={onOpenRecordUsage}
            className="flex items-center justify-center gap-1.5 bg-[#1F2633] hover:bg-orange-600/20 text-orange-400 hover:text-orange-300 text-xs sm:text-sm font-semibold p-2.5 sm:px-4 sm:py-2.5 rounded-xl border border-orange-500/40 shadow-md transition cursor-pointer text-center"
          >
            <Wrench className="w-4 h-4 shrink-0" />
            <span className="truncate">Use on Site</span>
          </button>

          <button
            onClick={onOpenNewTransfer}
            className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs sm:text-sm font-semibold p-2.5 sm:px-4 sm:py-2.5 rounded-xl shadow-lg shadow-orange-950/50 border border-orange-400/30 transition transform active:scale-95 cursor-pointer text-center"
          >
            <Plus className="w-4 h-4 stroke-[3] shrink-0" />
            <span className="truncate">New Dispatch</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid - 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* KPI 1: Active In-Transit */}
        <div 
          onClick={() => setActiveTab("transfers")}
          className="bg-[#161B23] p-3.5 sm:p-5 rounded-2xl border border-[#273142] hover:border-orange-500/50 transition cursor-pointer relative overflow-hidden group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-medium text-slate-400 truncate">In-Transit</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30 shrink-0">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{inTransitTransfers.length}</span>
            <span className="text-[10px] sm:text-xs text-orange-400 font-medium">on route</span>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">
            Awaiting receipt
          </p>
        </div>

        {/* KPI 2: Site Materials Consumed */}
        <div 
          onClick={() => setActiveTab("usage")}
          className="bg-[#161B23] p-3.5 sm:p-5 rounded-2xl border border-[#273142] hover:border-orange-500/40 transition cursor-pointer relative overflow-hidden group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-medium text-slate-400 truncate">Site Usage</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30 shrink-0">
              <ClipboardCheck className="w-4 h-4 text-orange-400" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{siteUsages.length}</span>
            <span className="text-[10px] sm:text-xs text-orange-400 font-medium">logs</span>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">
            With work notes
          </p>
        </div>

        {/* KPI 3: Main Warehouse Inventory */}
        <div 
          onClick={() => setActiveTab("inventory")}
          className="bg-[#161B23] p-3.5 sm:p-5 rounded-2xl border border-[#273142] hover:border-[#38465B] transition cursor-pointer relative overflow-hidden group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-medium text-slate-400 truncate">Main Whse</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-[#202735] text-slate-200 flex items-center justify-center border border-[#2C374A] shrink-0">
              <Boxes className="w-4 h-4 text-orange-400" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{mainWarehouseStock.toLocaleString()}</span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-medium">units</span>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">
            Tejgaon Central
          </p>
        </div>

        {/* KPI 4: Low Stock Alert */}
        <div 
          onClick={() => setActiveTab("inventory")}
          className="bg-[#161B23] p-3.5 sm:p-5 rounded-2xl border border-[#273142] hover:border-rose-500/40 transition cursor-pointer relative overflow-hidden group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-medium text-slate-400 truncate">Low Stock</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{lowStockItems.length}</span>
            <span className="text-[10px] sm:text-xs text-rose-400 font-medium">items</span>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">
            Needs restock
          </p>
        </div>

      </div>

      {/* Main Section: Active In-Transit Deliveries */}
      <div className="bg-[#161B23] rounded-2xl border border-[#273142] p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30 shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">Active Cargo In-Transit</h2>
              <p className="text-[11px] text-slate-400">Moving from Main Warehouse to sites</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab("transfers")}
            className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {inTransitTransfers.length === 0 ? (
          <div className="py-6 sm:py-8 text-center border border-dashed border-[#273142] rounded-xl bg-[#13161C]">
            <PackageCheck className="w-8 h-8 text-slate-500 mx-auto mb-1.5" />
            <p className="text-xs sm:text-sm font-medium text-slate-300">All dispatches have been safely received!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {inTransitTransfers.map((trf) => (
              <div 
                key={trf.id}
                className="bg-[#1C222C] border border-[#2B3545] hover:border-orange-500/40 rounded-xl p-3.5 sm:p-4 transition space-y-3"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                    {trf.challanNo}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                    In Transit
                  </span>
                </div>

                <div className="text-xs">
                  <div className="text-slate-300">
                    Tejgaon ➔ <strong className="text-white bg-[#252E3E] px-1.5 py-0.5 rounded">{trf.toLocationName}</strong>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Driver: {trf.driverName} ({trf.vehicleNo})
                  </div>
                </div>

                {/* Cargo Manifest pills */}
                <div className="bg-[#12161E] p-2 rounded-lg border border-[#242C3A] text-xs">
                  {trf.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-200 text-[11px] py-0.5">
                      <span className="truncate mr-2">{item.productName}</span>
                      <strong className="text-orange-400 font-mono shrink-0">{item.quantity} {item.unit}</strong>
                    </div>
                  ))}
                </div>

                {/* Mobile action buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onViewChallan(trf)}
                    className="flex items-center justify-center gap-1 bg-[#252E3E] text-slate-200 text-xs font-semibold py-2 rounded-xl border border-[#354359]"
                  >
                    <FileText className="w-3.5 h-3.5 text-orange-400" />
                    <span>Gate Pass</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Confirm receipt of Challan ${trf.challanNo} at ${trf.toLocationName}?`)) {
                        confirmReceiveTransfer(trf.id, userRole.name);
                      }
                    }}
                    className="flex items-center justify-center gap-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold py-2 rounded-xl shadow-md shadow-emerald-950/40"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm Received</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Materials Consumed on Sites */}
      <div className="bg-[#161B23] rounded-2xl border border-[#273142] p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Wrench className="w-4 h-4 text-orange-400" />
            <span>Recent Site Work (Materials Used)</span>
          </h3>
          <button 
            onClick={() => setActiveTab("usage")}
            className="text-xs text-orange-400 hover:text-orange-300 font-semibold"
          >
            All Logs →
          </button>
        </div>

        <div className="space-y-2.5">
          {siteUsages.slice(0, 3).map((usg) => (
            <div 
              key={usg.id} 
              className="bg-[#1C222C] p-3 rounded-xl border border-[#2B3545] text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">📍 {usg.locationName}</span>
                <span className="font-mono text-orange-400 font-bold bg-[#12161E] px-2 py-0.5 rounded border border-[#273142] text-[11px]">
                  - {usg.quantity} {usg.unit}
                </span>
              </div>

              <div className="text-slate-300 font-medium">{usg.productName}</div>

              <div className="bg-[#141820] p-2 rounded-lg border border-[#232A37] text-[11px] text-slate-300 italic">
                📝 "{usg.workDescription}"
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
                <span>By: <strong className="text-slate-200">{usg.reportedBy}</strong></span>
                <span>{new Date(usg.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
