import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  Boxes, 
  AlertTriangle, 
  ArrowRightLeft, 
  ChevronRight, 
  Building2,
  PackagePlus,
  SlidersHorizontal,
  Wrench,
  CheckCircle2
} from "lucide-react";
import { useInventory } from "../context/InventoryContext";

export default function InventoryView({ 
  onOpenNewTransferWithItem, 
  onOpenAddProduct,
  onOpenStockIn,
  onOpenRecordUsageWithItem
}) {
  const { products, branches, selectedLocation, setSelectedLocation } = useInventory();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Extract categories
  const categories = ["all", ...new Set(products.map((p) => p.category))];

  // Filtering products
  const filteredProducts = products.filter((prod) => {
    // Search match
    const matchesSearch = 
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.specs && prod.specs.toLowerCase().includes(searchQuery.toLowerCase()));

    // Category match
    const matchesCategory = selectedCategory === "all" || prod.category === selectedCategory;

    // Low stock filter match
    const mainQty = prod.stock?.loc_main || 0;
    const isLow = mainQty <= prod.minAlertLevel;
    const matchesLowStock = !showLowStockOnly || isLow;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  return (
    <div className="space-y-6">
      
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-orange-400" />
            <span>Electrical Equipment & Material Inventory</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time stock balance across Main Warehouse and all site locations
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          {/* Use / Consume at Site Action Button */}
          <button
            onClick={() => onOpenRecordUsageWithItem(null, selectedLocation !== "all" ? selectedLocation : null)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#1F2633] hover:bg-orange-600/20 text-orange-400 hover:text-orange-300 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-orange-500/40 shadow-sm transition cursor-pointer"
            title="Deduct material used/installed on a site with work notes"
          >
            <Wrench className="w-4 h-4" />
            <span>⚡ Use on Site (কাজে খরচ করা)</span>
          </button>

          <button
            onClick={onOpenStockIn}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#1F2633] hover:bg-[#283243] text-slate-200 text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-[#2F3A4C] transition cursor-pointer"
          >
            <PackagePlus className="w-4 h-4 text-emerald-400" />
            <span>Stock In</span>
          </button>

          <button
            onClick={onOpenAddProduct}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-orange-950/40 border border-orange-400/30 transition transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#161B23] p-4 rounded-2xl border border-[#273142] space-y-3 shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by cable size, breaker model, SKU, or specs..."
              className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition"
            />
          </div>

          {/* Location Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Building2 className="w-4 h-4 text-orange-400 shrink-0" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full md:w-56 bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="all">🏢 All Locations (Company Total)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.isMain ? `[Main Warehouse] ${b.name}` : `[Site] ${b.name}`}
                </option>
              ))}
            </select>
          </div>

          {/* Low Stock Filter Button */}
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer w-full md:w-auto justify-center ${
              showLowStockOnly
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                : "bg-[#1B212C] text-slate-400 border-[#2A3445] hover:text-white"
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${showLowStockOnly ? "text-rose-400" : "text-slate-400"}`} />
            <span>Low Stock Only</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-[11px] text-slate-500 font-mono shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1 rounded-lg shrink-0 transition font-medium cursor-pointer ${
                selectedCategory === cat
                  ? "bg-orange-600 text-white shadow-sm"
                  : "bg-[#1E2532] text-slate-400 hover:text-slate-200 border border-[#2A3445]"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#161B23] rounded-2xl border border-[#273142] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#262F3E] bg-[#12161E] text-[11px] uppercase font-mono tracking-wider text-slate-400">
                <th className="py-3 px-4">Item & Specification</th>
                <th className="py-3 px-3">SKU & Category</th>
                <th className="py-3 px-3 text-center">Main Warehouse Stock</th>
                <th className="py-3 px-3 text-center">
                  {selectedLocation === "all" ? "Distributed in Sites" : "Current Filter Stock"}
                </th>
                <th className="py-3 px-3 text-center">Total Company</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions (Dispatch / Use)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222A38] text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No electrical products found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const mainQty = prod.stock?.loc_main || 0;
                  
                  // Total across all branches except main
                  const siteQty = Object.entries(prod.stock || {})
                    .filter(([locId]) => locId !== "loc_main")
                    .reduce((sum, [, q]) => sum + Number(q || 0), 0);

                  const totalQty = mainQty + siteQty;
                  const isLow = mainQty <= prod.minAlertLevel;

                  // If user selected a specific location filter:
                  const currentFilterQty = selectedLocation === "all" 
                    ? siteQty 
                    : (prod.stock?.[selectedLocation] || 0);

                  // Has stock in at least one site to consume:
                  const hasSiteStock = siteQty > 0;

                  return (
                    <tr key={prod.id} className="hover:bg-[#1B212C] transition">
                      
                      {/* Product Name & Specs */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{prod.name}</div>
                        {prod.specs && (
                          <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{prod.specs}</div>
                        )}
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Unit: <strong className="text-orange-400">{prod.unit}</strong> | Approx Price: ৳{prod.unitPrice?.toLocaleString()}
                        </div>
                      </td>

                      {/* SKU & Category */}
                      <td className="py-3.5 px-3">
                        <span className="font-mono text-[11px] font-bold text-slate-300 bg-[#12161E] px-2 py-0.5 rounded border border-[#273142]">
                          {prod.sku}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1">{prod.category}</div>
                      </td>

                      {/* Main Warehouse Stock */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="font-mono text-sm font-bold text-white">
                          {mainQty.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-400">in Main Warehouse</span>
                      </td>

                      {/* Site or Filter Stock */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="font-mono text-sm font-bold text-sky-400">
                          {currentFilterQty.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {selectedLocation === "all" ? "across 4 sites" : "in this branch"}
                        </span>
                      </td>

                      {/* Total Overall */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="font-mono text-sm font-bold text-slate-200">
                          {totalQty.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-500">{prod.unit}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Low Stock (≤{prod.minAlertLevel})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Action buttons: Dispatch & Use on Site */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* 1. Dispatch from Main Warehouse */}
                          <button
                            onClick={() => onOpenNewTransferWithItem(prod)}
                            disabled={mainQty <= 0}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              mainQty > 0
                                ? "bg-[#252E3E] hover:bg-[#323E54] text-slate-200 hover:text-white border border-[#3A4963]"
                                : "bg-[#1E2532] text-slate-600 cursor-not-allowed border border-[#273142]"
                            }`}
                            title={mainQty > 0 ? "Dispatch to Project Site" : "Zero stock in Main Warehouse"}
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5 text-orange-400" />
                            <span>Dispatch</span>
                          </button>

                          {/* 2. Use / Consume on Site (User's specific requested feature!) */}
                          <button
                            onClick={() => onOpenRecordUsageWithItem(prod, selectedLocation !== "all" ? selectedLocation : null)}
                            disabled={!hasSiteStock}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              hasSiteStock
                                ? "bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white border border-orange-500/40"
                                : "bg-[#1E2532] text-slate-600 cursor-not-allowed border border-[#273142]"
                            }`}
                            title={hasSiteStock ? "Deduct materials consumed on site with work details" : "No stock currently stationed at project sites"}
                          >
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Use on Site</span>
                          </button>

                        </div>
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
