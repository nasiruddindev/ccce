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

  // Total stock across all locations
  const totalStockUnits = products.reduce((acc, prod) => {
    const sumForProduct = Object.values(prod.stock || {}).reduce((s, q) => s + Number(q || 0), 0);
    return acc + sumForProduct;
  }, 0);

  // Main warehouse stock count
  const mainWarehouseStock = products.reduce((acc, prod) => {
    return acc + Number(prod.stock?.loc_main || 0);
  }, 0);

  // Low stock products in main warehouse
  const lowStockItems = products.filter((prod) => {
    const mainQty = prod.stock?.loc_main || 0;
    return mainQty <= prod.minAlertLevel;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-[#171C24] via-[#1B222D] to-[#171C24] p-6 rounded-2xl border border-[#262F3E] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs uppercase font-mono tracking-wider text-orange-400 font-semibold">
              Live Dispatch & Site Operations Hub
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Electrical Material Dispatch & Site Usage
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Track materials moving from Central Warehouse to project sites, and record materials consumed/installed with task notes.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Use on Site CTA */}
          <button
            onClick={onOpenRecordUsage}
            className="flex items-center gap-1.5 bg-[#1F2633] hover:bg-orange-600/20 text-orange-400 hover:text-orange-300 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl border border-orange-500/40 shadow-md transition cursor-pointer"
          >
            <Wrench className="w-4 h-4" />
            <span>⚡ Use on Site (কাজে লাগানো)</span>
          </button>

          <button
            onClick={onOpenNewTransfer}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-orange-950/50 border border-orange-400/30 transition transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Dispatch Challan</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Active In-Transit */}
        <div 
          onClick={() => setActiveTab("transfers")}
          className="bg-[#161B23] p-5 rounded-2xl border border-[#273142] hover:border-orange-500/50 transition cursor-pointer relative overflow-hidden group shadow-lg"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-xl group-hover:bg-orange-500/10 transition"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">In-Transit Shipments</span>
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{inTransitTransfers.length}</span>
            <span className="text-xs text-orange-400 font-medium">On the road</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-orange-400" />
            Awaiting branch confirmation
          </p>
        </div>

        {/* KPI 2: Site Materials Consumed */}
        <div 
          onClick={() => setActiveTab("usage")}
          className="bg-[#161B23] p-5 rounded-2xl border border-[#273142] hover:border-orange-500/40 transition cursor-pointer relative overflow-hidden group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Material Installed on Sites</span>
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <ClipboardCheck className="w-5 h-5 text-orange-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{siteUsages.length}</span>
            <span className="text-xs text-orange-400 font-medium">Work logs</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Deducted from site with work notes
          </p>
        </div>

        {/* KPI 3: Main Warehouse Inventory */}
        <div 
          onClick={() => setActiveTab("inventory")}
          className="bg-[#161B23] p-5 rounded-2xl border border-[#273142] hover:border-[#38465B] transition cursor-pointer relative overflow-hidden group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Main Warehouse Stock</span>
            <div className="w-9 h-9 rounded-xl bg-[#202735] text-slate-200 flex items-center justify-center border border-[#2C374A]">
              <Boxes className="w-5 h-5 text-orange-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{mainWarehouseStock.toLocaleString()}</span>
            <span className="text-xs text-slate-400 font-medium">units</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Tejgaon Central Hub ready to dispatch
          </p>
        </div>

        {/* KPI 4: Low Stock Alert */}
        <div 
          onClick={() => setActiveTab("inventory")}
          className="bg-[#161B23] p-5 rounded-2xl border border-[#273142] hover:border-rose-500/40 transition cursor-pointer relative overflow-hidden group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Low Stock Warnings</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">{lowStockItems.length}</span>
            <span className="text-xs text-rose-400 font-medium">SKUs near alert</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Needs procurement or reorder
          </p>
        </div>

      </div>

      {/* Main Section: Active In-Transit Deliveries */}
      <div className="bg-[#161B23] rounded-2xl border border-[#273142] p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Active Dispatches (On The Way to Sites)</h2>
              <p className="text-xs text-slate-400">Products dispatched from Main Warehouse moving to project sites</p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab("transfers")}
            className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>View All Challans</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {inTransitTransfers.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-[#273142] rounded-xl bg-[#13161C]">
            <PackageCheck className="w-9 h-9 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-300">All dispatches have been safely received at project sites!</p>
            <p className="text-xs text-slate-500 mt-1">Click "New Dispatch Challan" to send materials to a branch.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {inTransitTransfers.map((trf) => (
              <div 
                key={trf.id}
                className="bg-[#1C222C] border border-[#2B3545] hover:border-orange-500/40 rounded-xl p-4 transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                      {trf.challanNo}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Dispatched on {new Date(trf.date).toLocaleDateString()} at {new Date(trf.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                      In Transit
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <span className="text-slate-300">{trf.fromLocationName}</span>
                    <span className="text-orange-400 font-bold">➔</span>
                    <span className="text-white bg-[#252E3E] px-2 py-0.5 rounded border border-[#333E53]">
                      📍 {trf.toLocationName}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-4 flex-wrap">
                    <span>Vehicle: <strong className="text-slate-200">{trf.vehicleNo || "N/A"}</strong></span>
                    <span>Driver: <strong className="text-slate-200">{trf.driverName || "N/A"}</strong> ({trf.driverPhone || "N/A"})</span>
                  </div>
                </div>

                <div className="bg-[#151921] px-3 py-2 rounded-lg border border-[#273142] text-xs space-y-1 min-w-[200px]">
                  <p className="text-[10px] uppercase font-mono text-slate-400 font-bold">Materials in Cargo:</p>
                  {trf.items.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-200">
                      <span className="truncate max-w-[150px]">{item.productName}</span>
                      <strong className="text-orange-400 font-mono">{item.quantity} {item.unit}</strong>
                    </div>
                  ))}
                  {trf.items.length > 2 && (
                    <p className="text-[10px] text-slate-400">+{trf.items.length - 2} more items</p>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                  <button
                    onClick={() => onViewChallan(trf)}
                    className="flex items-center gap-1.5 bg-[#252E3E] hover:bg-[#303B4F] text-slate-200 text-xs font-medium px-3 py-2 rounded-lg border border-[#354359] transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-orange-400" />
                    <span>View Gate Pass</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Confirm receipt of Challan ${trf.challanNo} at ${trf.toLocationName}? This will add the materials to the branch stock.`)) {
                        confirmReceiveTransfer(trf.id, userRole.name);
                      }
                    }}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-md shadow-emerald-950/40 transition cursor-pointer"
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

      {/* Two Column Grid: Site Material Consumed Logs & Branch Stock Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Site Material Consumption Log (Requested Feature!) */}
        <div className="bg-[#161B23] rounded-2xl border border-[#273142] p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-orange-400" />
              <span>Recent Materials Used on Sites (কাজের নোট সহ)</span>
            </h3>
            <button 
              onClick={() => setActiveTab("usage")}
              className="text-xs text-orange-400 hover:text-orange-300 font-semibold"
            >
              All Usage Logs →
            </button>
          </div>

          <div className="space-y-3">
            {siteUsages.slice(0, 4).map((usg) => (
              <div 
                key={usg.id} 
                className="bg-[#1C222C] p-3.5 rounded-xl border border-[#2B3545] text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">📍 {usg.locationName}</span>
                  <span className="font-mono text-orange-400 font-bold bg-[#12161E] px-2 py-0.5 rounded border border-[#273142]">
                    - {usg.quantity} {usg.unit}
                  </span>
                </div>

                <div className="text-slate-300 font-medium">{usg.productName}</div>

                <div className="bg-[#141820] p-2 rounded-lg border border-[#232A37] text-[11px] text-slate-300 italic">
                  📝 "{usg.workDescription}"
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
                  <span>Reported by: <strong className="text-slate-200">{usg.reportedBy}</strong></span>
                  <span>{new Date(usg.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Branch Stock Distribution */}
        <div className="bg-[#161B23] rounded-2xl border border-[#273142] p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-400" />
              <span>Material Holdings by Location</span>
            </h3>
            <button 
              onClick={() => setActiveTab("branches")}
              className="text-xs text-slate-400 hover:text-white"
            >
              All Locations →
            </button>
          </div>

          <div className="space-y-3">
            {branches.map((b) => {
              const branchTotal = products.reduce((acc, p) => acc + Number(p.stock?.[b.id] || 0), 0);
              const percentage = totalStockUnits > 0 ? Math.round((branchTotal / totalStockUnits) * 100) : 0;

              return (
                <div key={b.id} className="bg-[#1C222C] p-3 rounded-xl border border-[#2B3545]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${b.isMain ? "bg-orange-500" : "bg-sky-400"}`}></span>
                      <strong className="text-white">{b.name}</strong>
                    </div>
                    <span className="font-mono text-slate-300 font-semibold">
                      {branchTotal.toLocaleString()} units ({percentage}%)
                    </span>
                  </div>
                  
                  <div className="w-full h-2 bg-[#12161E] rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        b.isMain 
                          ? "bg-gradient-to-r from-orange-500 to-amber-500" 
                          : "bg-gradient-to-r from-sky-500 to-cyan-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
                    <span>Lead: {b.inCharge}</span>
                    <span>{b.code}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
