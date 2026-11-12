import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Calendar,
  Layers,
  Wrench,
  Package
} from "lucide-react";
import { useInventory } from "../context/InventoryContext";
import Badge from "../components/common/Badge";

export default function StockMovementHistory() {
  const { movements, branches } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredMovements = movements.filter((m) => {
    const matchesSearch =
      (m.productName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.sku || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.referenceNo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.performedBy || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.reason || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || m.type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stock Movement Audit Trail</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete immutable ledger of material issues, site installations, factory receipts, and inter-branch transfers.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by SKU, product, reference, or job description..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Movement Types</option>
            <option value="In Use (This Branch)">In Use (This Branch)</option>
            <option value="Transfer Out">Transfer Out</option>
            <option value="Transfer In">Transfer In</option>
            <option value="Site Consumption">Site Consumption</option>
            <option value="Procurement Inflow">Procurement Inflow</option>
            <option value="Stock Adjustment">Stock Adjustment</option>
          </select>
        </div>
      </div>

      {/* Movement Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Ref Number</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Product & SKU</th>
                <th className="py-3.5 px-4">From &rarr; To Location / Task</th>
                <th className="py-3.5 px-4 text-right">Quantity</th>
                <th className="py-3.5 px-4">Officer / Engineer</th>
                <th className="py-3.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No movement records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m) => {
                  const isOutflow = m.quantity < 0;
                  const isInUse = m.type?.includes("In Use");

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        {m.referenceNo}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                            isInUse
                              ? "bg-amber-100 text-amber-900 border border-amber-300 font-bold"
                              : m.type.includes("In")
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : m.type.includes("Consumption")
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : m.type.includes("Adjustment")
                              ? "bg-slate-100 text-slate-800 border border-slate-300"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {isInUse && <Wrench className="w-3 h-3 text-amber-700 shrink-0" />}
                          <span>{m.type}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <span className="font-bold text-slate-900 block truncate">{m.productName}</span>
                        <span className="font-mono text-[10px] text-slate-400">{m.sku}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        <div className="font-medium text-slate-800 truncate max-w-[220px]">
                          {m.sourceBranch}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          &rarr; {m.destinationBranch}
                        </div>
                        {m.reason && (
                          <div className="text-[10px] text-amber-800/90 font-medium italic mt-0.5 truncate max-w-[240px]">
                            Task: {m.reason}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <span className={isOutflow ? "text-rose-600" : "text-emerald-600"}>
                          {m.quantity > 0 ? `+${m.quantity}` : m.quantity} {m.unit}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {m.performedBy}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        {new Date(m.date).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}