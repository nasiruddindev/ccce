import React, { useState } from "react";
import { Building2, Plus, Phone, MapPin, Boxes, ArrowRight, ShieldCheck } from "lucide-react";
import { useInventory } from "../context/InventoryContext";

export default function BranchesView({ onOpenNewTransfer, setSelectedLocation, setActiveTab }) {
  const { branches, products, addBranch } = useInventory();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBranch, setNewBranch] = useState({
    name: "",
    code: "",
    address: "",
    inCharge: "",
    phone: ""
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newBranch.name.trim()) return;

    addBranch({
      ...newBranch,
      code: newBranch.code || `SITE-${Math.floor(100 + Math.random() * 900)}`
    });

    setNewBranch({ name: "", code: "", address: "", inCharge: "", phone: "" });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-400 shrink-0" />
            <span>Warehouses & Project Sites Directory</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Main Central Warehouse and affiliated project sites
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-orange-950/40 border border-orange-400/30 transition transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Project Site</span>
        </button>
      </div>

      {/* Grid of Locations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {branches.map((b) => {
          // Count total items and distinct SKUs at this branch
          const totalUnits = products.reduce((acc, p) => acc + Number(p.stock?.[b.id] || 0), 0);
          const distinctSKUs = products.filter((p) => Number(p.stock?.[b.id] || 0) > 0).length;

          return (
            <div 
              key={b.id}
              className={`rounded-2xl border p-5 shadow-xl transition space-y-4 relative flex flex-col justify-between ${
                b.isMain
                  ? "bg-gradient-to-b from-[#1E2533] to-[#161B23] border-orange-500/40 ring-1 ring-orange-500/30"
                  : "bg-[#161B23] border-[#273142] hover:border-[#3A485C]"
              }`}
            >
              <div>
                {/* Header tag */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                    b.isMain 
                      ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                      : "bg-[#1F2633] text-sky-400 border-[#2E394C]"
                  }`}>
                    {b.isMain ? "Central Hub" : "Project Site"}
                  </span>
                  <span className="font-mono text-xs text-slate-400 font-bold">{b.code}</span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">{b.name}</h3>
                
                <div className="space-y-1.5 mt-3 text-xs text-slate-300">
                  <p className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    <span>{b.address || "Address on file"}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>In-Charge: <strong className="text-white">{b.inCharge}</strong></span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-mono text-slate-300">{b.phone}</span>
                  </p>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="pt-3 border-t border-[#232B3B] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Stock Units</span>
                    <p className="font-mono text-sm font-bold text-white">{totalUnits.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Materials</span>
                    <p className="font-mono text-sm font-bold text-orange-400">{distinctSKUs} SKUs</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedLocation(b.id);
                      setActiveTab("inventory");
                    }}
                    className="flex-1 bg-[#1E2532] hover:bg-[#283243] text-slate-200 text-xs py-2 rounded-xl border border-[#2B3547] text-center font-medium transition cursor-pointer"
                  >
                    View Stock
                  </button>

                  {!b.isMain && (
                    <button
                      onClick={() => onOpenNewTransfer()}
                      className="bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white border border-orange-500/40 text-xs px-3 py-2 rounded-xl transition cursor-pointer"
                      title="Dispatch materials to this site"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Site Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#161B23] border border-[#2B3547] rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <h2 className="text-base font-bold text-white">Add New Project Site / Branch</h2>
            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Site / Branch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rampura Grid Substation"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                  className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Site Code</label>
                <input
                  type="text"
                  placeholder="e.g. SITE-RAMPURA"
                  value={newBranch.code}
                  onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value })}
                  className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Site Address</label>
                <input
                  type="text"
                  placeholder="e.g. Rampura DIT Road, Dhaka"
                  value={newBranch.address}
                  onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                  className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Site In-Charge</label>
                  <input
                    type="text"
                    placeholder="Supervisor name"
                    value={newBranch.inCharge}
                    onChange={(e) => setNewBranch({ ...newBranch, inCharge: e.target.value })}
                    className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+880 17XX-XXXXXX"
                    value={newBranch.phone}
                    onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                    className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#232B3B] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-500 text-white font-semibold px-4 py-2 rounded-xl transition"
                >
                  Create Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
