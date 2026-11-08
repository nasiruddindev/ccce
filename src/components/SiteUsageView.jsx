import React, { useState } from "react";
import { ClipboardCheck, Plus, Search, Calendar, UserCheck, Building2 } from "lucide-react";
import { useInventory } from "../context/InventoryContext";

export default function SiteUsageView({ onOpenRecordUsage }) {
  const { siteUsages, branches } = useInventory();
  const [selectedBranchFilter, setSelectedBranchFilter] = useState("all");

  const filteredUsages = siteUsages.filter((u) => {
    if (selectedBranchFilter === "all") return true;
    return u.locationId === selectedBranchFilter;
  });

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-orange-400" />
            <span>Site Material Usage & Installation Logs</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Log electrical materials installed at project sites to keep true physical remaining stock
          </p>
        </div>

        <button
          onClick={onOpenRecordUsage}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-orange-950/40 border border-orange-400/30 transition transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Record Site Consumption</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-[#161B23] p-4 rounded-2xl border border-[#273142] flex items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-orange-400" />
          <span className="text-xs text-slate-400">Filter by Site:</span>
          <select
            value={selectedBranchFilter}
            onChange={(e) => setSelectedBranchFilter(e.target.value)}
            className="bg-[#11141B] border border-[#273142] text-xs text-white px-3 py-1.5 rounded-lg focus:outline-none"
          >
            <option value="all">All Project Sites</option>
            {branches.filter((b) => !b.isMain).map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Usage Table */}
      <div className="bg-[#161B23] rounded-2xl border border-[#273142] overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#262F3E] bg-[#12161E] text-[11px] uppercase font-mono tracking-wider text-slate-400">
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-3">Project Site</th>
              <th className="py-3 px-3">Material Used</th>
              <th className="py-3 px-3 text-center">Quantity Installed</th>
              <th className="py-3 px-4">Installation Purpose</th>
              <th className="py-3 px-4 text-right">Reported By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222A38]">
            {filteredUsages.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No consumption records logged yet.
                </td>
              </tr>
            ) : (
              filteredUsages.map((u) => (
                <tr key={u.id} className="hover:bg-[#1B212C] transition">
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {new Date(u.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">
                    📍 {u.locationName}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-200">
                    {u.productName}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-mono text-orange-400 font-bold bg-[#12161E] px-2 py-0.5 rounded border border-[#273142]">
                      {u.quantity} {u.unit}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {u.workDescription}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">
                    <div className="flex items-center justify-end gap-1 text-slate-300">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{u.reportedBy}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
