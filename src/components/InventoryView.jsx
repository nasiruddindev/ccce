import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  Boxes, 
  AlertTriangle, 
  ArrowRightLeft, 
  Building2,
  PackagePlus,
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
    const matchesSearch = 
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.specs && prod.specs.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || prod.category === selectedCategory;

    const mainQty = prod.stock?.loc_main || 0;
    const isLow = mainQty <= prod.minAlertLevel;
    const matchesLowStock = !showLowStockOnly || isLow;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-6">
      
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-orange-400 shrink-0" />
            <span>Electrical Stock Inventory</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Central Warehouse and active project sites stock balance
          </p>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-3 sm:flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onOpenRecordUsageWithItem(null, selectedLocation !== "all" ? selectedLocation : null)}
            className="flex items-center justify-center gap-1 bg-[#1F2633] hover:bg-orange-600/20 text-orange-400 hover:text-orange-300 text-[11px] sm:text-xs font-semibold p-2 sm:px-3 sm:py-2.5 rounded-xl border border-orange-500/40 shadow-sm transition text-center"
            title="Deduct material used on site"
          >
            <Wrench className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Use on Site</span>
          </button>

          <button
            onClick={onOpenStockIn}
            className="flex items-center justify-center gap-1 bg-[#1F2633] hover:bg-[#283243] text-slate-200 text-[11px] sm:text-xs font-semibold p-2 sm:px-3 sm:py-2.5 rounded-xl border border-[#2F3A4C] transition text-center"
          >
            <PackagePlus className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Stock In</span>
          </button>

          <button
            onClick={onOpenAddProduct}
            className="flex items-center justify-center gap-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-[11px] sm:text-xs font-semibold p-2 sm:px-4 sm:py-2.5 rounded-xl shadow-lg shadow-orange-950/40 border border-orange-400/30 transition text-center"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3] shrink-0" />
            <span className="truncate">Add Item</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#161B23] p-3 sm:p-4 rounded-2xl border border-[#273142] space-y-2.5 sm:space-y-3 shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-2.5 sm:gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cable, breaker, SKU, specs..."
              className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Location Filter */}
            <div className="flex-1 md:w-56 flex items-center gap-1.5 bg-[#11141B] border border-[#273142] rounded-xl px-2.5 py-1.5">
              <Building2 className="w-4 h-4 text-orange-400 shrink-0" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full bg-transparent text-xs text-white focus:outline-none cursor-pointer truncate"
              >
                <option value="all">🏢 All Locations (Total)</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.isMain ? `[Main] ${b.name}` : `📍 ${b.name}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Low Stock Filter Button */}
            <button
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border transition shrink-0 ${
                showLowStockOnly
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : "bg-[#1B212C] text-slate-400 border-[#2A3445]"
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${showLowStockOnly ? "text-rose-400" : "text-slate-400"}`} />
              <span className="hidden xs:inline">Low Stock</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills (Horizontal Scroll) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[11px] sm:text-xs px-2.5 py-1 rounded-lg shrink-0 transition font-medium cursor-pointer ${
                selectedCategory === cat
                  ? "bg-orange-600 text-white font-semibold"
                  : "bg-[#1E2532] text-slate-400 hover:text-slate-200 border border-[#2A3445]"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* MOBILE VIEW (< md): Card-Based Touch Layout */}
      <div className="md:hidden space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-[#161B23] rounded-2xl border border-[#273142]">
            No electrical items match search.
          </div>
        ) : (
          filteredProducts.map((prod) => {
            const mainQty = prod.stock?.loc_main || 0;
            const siteQty = Object.entries(prod.stock || {})
              .filter(([locId]) => locId !== "loc_main")
              .reduce((sum, [, q]) => sum + Number(q || 0), 0);
            const totalQty = mainQty + siteQty;
            const isLow = mainQty <= prod.minAlertLevel;
            const currentFilterQty = selectedLocation === "all" 
              ? siteQty 
              : (prod.stock?.[selectedLocation] || 0);

            return (
              <div 
                key={prod.id}
                className="bg-[#161B23] border border-[#273142] rounded-2xl p-4 shadow-lg space-y-3"
              >
                {/* Header: Name + Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-white text-sm leading-tight">{prod.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-[10px] font-bold text-slate-300 bg-[#11141B] px-1.5 py-0.2 rounded border border-[#242C3C]">
                        {prod.sku}
                      </span>
                      <span className="text-[10px] text-slate-400">{prod.category}</span>
                    </div>
                  </div>

                  {isLow ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                      Low
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                      OK
                    </span>
                  )}
                </div>

                {prod.specs && (
                  <p className="text-[11px] text-slate-400 line-clamp-1">{prod.specs}</p>
                )}

                {/* Stock Stats Grid */}
                <div className="grid grid-cols-3 gap-2 bg-[#11141B] p-2.5 rounded-xl border border-[#232B3B] text-center text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-mono text-slate-400 block">Main Whse</span>
                    <strong className="text-white font-mono text-sm">{mainQty}</strong>
                    <span className="text-[9px] text-slate-500 block">{prod.unit}</span>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-mono text-sky-400 block">
                      {selectedLocation === "all" ? "Sites Stock" : "Site Stock"}
                    </span>
                    <strong className="text-sky-400 font-mono text-sm">{currentFilterQty}</strong>
                    <span className="text-[9px] text-slate-500 block">{prod.unit}</span>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-mono text-slate-400 block">Total Co.</span>
                    <strong className="text-slate-200 font-mono text-sm">{totalQty}</strong>
                    <span className="text-[9px] text-slate-500 block">{prod.unit}</span>
                  </div>
                </div>

                {/* Action Buttons: Large Touch Targets */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onOpenNewTransferWithItem(prod)}
                    disabled={mainQty <= 0}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition ${
                      mainQty > 0
                        ? "bg-[#252E3E] text-slate-100 hover:bg-[#323E54] border border-[#3A4963]"
                        : "bg-[#1E2532] text-slate-600 cursor-not-allowed"
                    }`}
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-orange-400" />
                    <span>Dispatch</span>
                  </button>

                  <button
                    onClick={() => onOpenRecordUsageWithItem(prod, selectedLocation !== "all" ? selectedLocation : null)}
                    disabled={siteQty <= 0}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold transition ${
                      siteQty > 0
                        ? "bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-950/40"
                        : "bg-[#1E2532] text-slate-600 cursor-not-allowed"
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Use on Site</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP VIEW (>= md): Full Responsive Table */}
      <div className="hidden md:block bg-[#161B23] rounded-2xl border border-[#273142] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#262F3E] bg-[#12161E] text-[11px] uppercase font-mono tracking-wider text-slate-400">
                <th className="py-3 px-4">Item & Specification</th>
                <th className="py-3 px-3">SKU & Category</th>
                <th className="py-3 px-3 text-center">Main Whse Stock</th>
                <th className="py-3 px-3 text-center">
                  {selectedLocation === "all" ? "Distributed in Sites" : "Current Filter Stock"}
                </th>
                <th className="py-3 px-3 text-center">Total Company</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
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
                  const siteQty = Object.entries(prod.stock || {})
                    .filter(([locId]) => locId !== "loc_main")
                    .reduce((sum, [, q]) => sum + Number(q || 0), 0);
                  const totalQty = mainQty + siteQty;
                  const isLow = mainQty <= prod.minAlertLevel;
                  const currentFilterQty = selectedLocation === "all" 
                    ? siteQty 
                    : (prod.stock?.[selectedLocation] || 0);
                  const hasSiteStock = siteQty > 0;

                  return (
                    <tr key={prod.id} className="hover:bg-[#1B212C] transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{prod.name}</div>
                        {prod.specs && (
                          <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{prod.specs}</div>
                        )}
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Unit: <strong className="text-orange-400">{prod.unit}</strong> | Approx: ৳{prod.unitPrice?.toLocaleString()}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-mono text-[11px] font-bold text-slate-300 bg-[#12161E] px-2 py-0.5 rounded border border-[#273142]">
                          {prod.sku}
                        </span>
                        <div className="text-[11px] text-slate-400 mt-1">{prod.category}</div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <div className="font-mono text-sm font-bold text-white">
                          {mainQty.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-400">Tejgaon Hub</span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <div className="font-mono text-sm font-bold text-sky-400">
                          {currentFilterQty.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {selectedLocation === "all" ? "across 4 sites" : "in this site"}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <div className="font-mono text-sm font-bold text-slate-200">
                          {totalQty.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-500">{prod.unit}</span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            In Stock
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onOpenNewTransferWithItem(prod)}
                            disabled={mainQty <= 0}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              mainQty > 0
                                ? "bg-[#252E3E] hover:bg-[#323E54] text-slate-200 hover:text-white border border-[#3A4963]"
                                : "bg-[#1E2532] text-slate-600 cursor-not-allowed border border-[#273142]"
                            }`}
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5 text-orange-400" />
                            <span>Dispatch</span>
                          </button>

                          <button
                            onClick={() => onOpenRecordUsageWithItem(prod, selectedLocation !== "all" ? selectedLocation : null)}
                            disabled={!hasSiteStock}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              hasSiteStock
                                ? "bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white border border-orange-500/40"
                                : "bg-[#1E2532] text-slate-600 cursor-not-allowed border border-[#273142]"
                            }`}
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
