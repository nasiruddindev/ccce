import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Boxes,
  Building2,
  Search,
  Filter,
  ArrowRightLeft,
  AlertTriangle,
  Package,
  Layers,
  CheckCircle2
} from "lucide-react";
import { useInventory } from "../context/InventoryContext";
import Badge from "../components/common/Badge";

export default function BranchInventory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const branchParam = searchParams.get("branch");

  const {
    branches,
    products,
    selectedBranchId,
    setSelectedBranchId,
    getProductStockInBranch,
    getProductStatus,
    calculateTotalStock
  } = useInventory();

  // Selected branch can be from query params or context
  const activeBranch = branchParam || selectedBranchId || "all";
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const handleBranchTabChange = (branchId) => {
    setSelectedBranchId(branchId);
    setSearchParams(branchId === "all" ? {} : { branch: branchId });
  };

  // Filter inventory
  const filteredProducts = products.filter((p) => {
    const qty = activeBranch === "all" ? calculateTotalStock(p) : getProductStockInBranch(p, activeBranch);
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === "all" || p.category === categoryFilter;

    return matchesSearch && matchesCat;
  });

  const currentBranchObj = branches.find((b) => b.id === activeBranch);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Branch Inventory Matrix</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time stock balance tracking per depot, project site, and regional warehouse.
          </p>
        </div>
        <Link
          to="/stock-transfer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-xs"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>New Stock Transfer</span>
        </Link>
      </div>

      {/* Branch Tabs Filter */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => handleBranchTabChange("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeBranch === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>All Locations (Global Stock)</span>
          </button>

          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => handleBranchTabChange(b.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
                activeBranch === b.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{b.code}</span>
              {b.isMain && (
                <span className={`text-[9px] px-1 py-0.2 rounded font-bold ${activeBranch === b.id ? "bg-blue-800 text-blue-200" : "bg-slate-100 text-slate-500"}`}>
                  MAIN
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search electrical items in this branch..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">
            Viewing: <strong className="text-slate-800">{currentBranchObj ? currentBranchObj.name : "Company-Wide Total"}</strong>
          </span>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Product Details</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Brand</th>
                <th className="py-3.5 px-4 text-right">Available Quantity</th>
                <th className="py-3.5 px-4 text-center">Safety Level</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Transfer Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((prod) => {
                const stockQty =
                  activeBranch === "all"
                    ? calculateTotalStock(prod)
                    : getProductStockInBranch(prod, activeBranch);
                const status = getProductStatus(prod, activeBranch);

                return (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100";
                          }}
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/products/${prod.id}`}
                            className="font-bold text-slate-900 hover:text-blue-600 block truncate"
                          >
                            {prod.name}
                          </Link>
                          <span className="text-[10px] text-slate-400">
                            Unit Price: ৳{prod.unitPrice?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      {prod.sku}
                    </td>

                    <td className="py-3 px-4 text-slate-600">{prod.category}</td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{prod.brand}</span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-sm text-slate-900">
                        {stockQty.toLocaleString()}
                      </span>
                      <span className="text-slate-400 text-[10px] ml-1">{prod.unit}</span>
                    </td>

                    <td className="py-3 px-4 text-center font-mono text-slate-500 text-[11px]">
                      {prod.minAlertLevel} {prod.unit}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <Badge
                        variant={
                          status === "In Stock"
                            ? "success"
                            : status === "Low Stock"
                            ? "warning"
                            : "danger"
                        }
                        size="sm"
                      >
                        {status}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/stock-transfer?product=${prod.id}&source=${activeBranch === "all" ? (branches.find(b => b.isMain)?.id || "loc_gazaria_230") : activeBranch}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>Dispatch</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
