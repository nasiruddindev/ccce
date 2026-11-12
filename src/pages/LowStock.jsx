import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRightLeft,
  Search,
  ShoppingCart,
  Boxes,
  ShieldAlert,
  ArrowUpRight
} from "lucide-react";
import { useInventory } from "../context/InventoryContext";
import Badge from "../components/common/Badge";

export default function LowStock() {
  const { products, calculateTotalStock, getProductStatus } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");

  const lowStockItems = products.filter((p) => {
    const total = calculateTotalStock(p);
    return total <= p.minAlertLevel;
  });

  const filteredItems = lowStockItems.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <span>Low Stock & Depletion Alerts</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Immediate replenishment priority list for electrical materials nearing minimum safety reserves.
          </p>
        </div>

        <Link
          to="/stock-transfer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-xs"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Inter-Branch Stock Rebalance</span>
        </Link>
      </div>

      {/* Top Banner Alert */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <p className="font-bold">Attention Required:</p>
          <p className="text-amber-800 mt-0.5">
            There are currently <strong>{lowStockItems.length} electrical products</strong> that have dropped below their mandated engineering minimum safety reserve. Recommend initiating procurement purchase orders or transferring reserves from Central Logistics Hub.
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search low stock SKUs or manufacturers..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold">
          {filteredItems.length} Alert Items
        </span>
      </div>

      {/* Low Stock Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Brand</th>
                <th className="py-3.5 px-4 text-right">Current Stock</th>
                <th className="py-3.5 px-4 text-right">Min Threshold</th>
                <th className="py-3.5 px-4 text-right">Deficit</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-600">No items below alert threshold</p>
                    <p className="text-[11px] text-slate-400">All inventory safety buffers are healthy.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((prod) => {
                  const total = calculateTotalStock(prod);
                  const deficit = Math.max(0, prod.minAlertLevel - total);
                  const status = getProductStatus(prod);

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 max-w-xs">
                        <Link
                          to={`/products/${prod.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 block truncate"
                        >
                          {prod.name}
                        </Link>
                        <span className="text-[10px] text-slate-400">{prod.category}</span>
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                        {prod.sku}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{prod.brand}</span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="font-extrabold text-sm text-amber-700">
                          {total}
                        </span>{" "}
                        <span className="text-[10px] text-slate-500">{prod.unit}</span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        {prod.minAlertLevel} {prod.unit}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">
                        -{deficit} {prod.unit}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <Badge variant={status === "Out of Stock" ? "danger" : "warning"} size="sm">
                          {status}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <Link
                          to={`/stock-transfer?product=${prod.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition shadow-2xs"
                        >
                          <ArrowRightLeft className="w-3 h-3" />
                          <span>Reorder / Transfer</span>
                        </Link>
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
