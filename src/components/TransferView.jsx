import React, { useState } from "react";
import { 
  Truck, 
  Plus, 
  Search, 
  FileText, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowRight, 
  RotateCcw,
  Building2,
  Calendar,
  Phone,
  UserCheck
} from "lucide-react";
import { useInventory } from "../context/InventoryContext";

export default function TransferView({ onOpenNewTransfer, onViewChallan }) {
  const { transfers, confirmReceiveTransfer, userRole } = useInventory();

  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'in_transit' | 'received'
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransfers = transfers.filter((trf) => {
    // Status filter
    if (activeTab === "in_transit" && trf.status !== "in_transit") return false;
    if (activeTab === "received" && trf.status !== "received") return false;

    // Search filter
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      trf.challanNo.toLowerCase().includes(q) ||
      trf.toLocationName.toLowerCase().includes(q) ||
      (trf.driverName && trf.driverName.toLowerCase().includes(q)) ||
      (trf.vehicleNo && trf.vehicleNo.toLowerCase().includes(q)) ||
      trf.items.some((i) => i.productName.toLowerCase().includes(q));

    return matchesSearch;
  });

  const inTransitCount = transfers.filter((t) => t.status === "in_transit").length;
  const receivedCount = transfers.filter((t) => t.status === "received").length;

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-orange-400" />
            <span>Site Delivery Challans & Stock Transfers</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage dispatch orders from Main Warehouse to project sites with verifiable delivery challans
          </p>
        </div>

        <button
          onClick={onOpenNewTransfer}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-orange-950/40 border border-orange-400/30 transition transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Dispatch Order</span>
        </button>
      </div>

      {/* Filter and Tab Navigation */}
      <div className="bg-[#161B23] p-4 rounded-2xl border border-[#273142] flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        
        {/* Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "all"
                ? "bg-orange-600 text-white"
                : "bg-[#1E2532] text-slate-400 hover:text-white border border-[#2B3545]"
            }`}
          >
            All Transfers ({transfers.length})
          </button>

          <button
            onClick={() => setActiveTab("in_transit")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "in_transit"
                ? "bg-amber-600 text-white"
                : "bg-[#1E2532] text-amber-400 hover:text-amber-300 border border-amber-500/30"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>In Transit ({inTransitCount})</span>
          </button>

          <button
            onClick={() => setActiveTab("received")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "received"
                ? "bg-emerald-600 text-white"
                : "bg-[#1E2532] text-emerald-400 hover:text-emerald-300 border border-emerald-500/30"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Delivered & Verified ({receivedCount})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Challan #, Site, Driver..."
            className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl pl-10 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
          />
        </div>

      </div>

      {/* Transfers List */}
      <div className="space-y-4">
        {filteredTransfers.length === 0 ? (
          <div className="bg-[#161B23] p-12 rounded-2xl border border-[#273142] text-center text-slate-400">
            <Truck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-300">No transfer challans found</p>
            <p className="text-xs text-slate-500 mt-1">Adjust your filters or create a new delivery challan.</p>
          </div>
        ) : (
          filteredTransfers.map((trf) => {
            const isInTransit = trf.status === "in_transit";

            return (
              <div 
                key={trf.id}
                className="bg-[#161B23] border border-[#273142] hover:border-[#38465B] rounded-2xl p-5 shadow-xl transition space-y-4"
              >
                {/* Header row: Challan No, Dates, Status Badge */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#232B39] pb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-sm font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/30">
                      {trf.challanNo}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(trf.date).toLocaleDateString()} {new Date(trf.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <div>
                    {isInTransit ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                        In Transit (On Route)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Received & Added to Site Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Route & Transport Logistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  
                  {/* Origin & Destination */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Transfer Route</span>
                    <div className="flex items-center gap-2 font-semibold">
                      <span className="text-slate-300">{trf.fromLocationName}</span>
                      <ArrowRight className="w-4 h-4 text-orange-400 shrink-0" />
                      <span className="text-white bg-[#1F2633] px-2 py-0.5 rounded border border-[#2D384A]">
                        {trf.toLocationName}
                      </span>
                    </div>
                  </div>

                  {/* Vehicle & Driver */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Transport Logistics</span>
                    <div className="text-slate-200">
                      Vehicle: <strong className="text-white">{trf.vehicleNo || "Direct Site Truck"}</strong>
                    </div>
                    <div className="text-slate-400 flex items-center gap-1">
                      <span>Driver: {trf.driverName || "Assigned Driver"}</span>
                      {trf.driverPhone && (
                        <span className="text-orange-400">({trf.driverPhone})</span>
                      )}
                    </div>
                  </div>

                  {/* In-Charge Details */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Dispatched & Received By</span>
                    <div className="text-slate-300">
                      Dispatched by: <strong className="text-slate-100">{trf.dispatchedBy || "Central Store"}</strong>
                    </div>
                    {trf.receivedBy && (
                      <div className="text-emerald-400 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        Received by: <strong>{trf.receivedBy}</strong>
                      </div>
                    )}
                  </div>

                </div>

                {/* Items Manifest */}
                <div className="bg-[#12161E] rounded-xl border border-[#242C3A] p-3">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold mb-2">
                    Cargo Manifest ({trf.items.length} items)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {trf.items.map((item, idx) => (
                      <div key={idx} className="bg-[#181D26] p-2 rounded-lg border border-[#283242] flex items-center justify-between text-xs">
                        <div className="truncate mr-2">
                          <p className="text-white font-medium truncate">{item.productName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{item.sku}</p>
                        </div>
                        <div className="font-mono text-orange-400 font-bold shrink-0 bg-[#12161E] px-2 py-1 rounded border border-[#2A3445]">
                          {item.quantity} {item.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                  {trf.notes && (
                    <div className="text-[11px] text-slate-400 mt-2.5 italic">
                      Note: "{trf.notes}"
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => onViewChallan(trf)}
                    className="flex items-center gap-1.5 bg-[#202735] hover:bg-[#2B3547] text-slate-200 text-xs font-medium px-4 py-2 rounded-xl border border-[#303B4F] transition cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-orange-400" />
                    <span>Print Delivery Challan (Gate Pass)</span>
                  </button>

                  {isInTransit && (
                    <button
                      onClick={() => {
                        if (confirm(`Confirm that Challan ${trf.challanNo} with ${trf.items.length} items has safely arrived at ${trf.toLocationName}?`)) {
                          confirmReceiveTransfer(trf.id, userRole.name);
                        }
                      }}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md shadow-emerald-950/40 transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Received at Branch</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
