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
  CheckCircle2,
  Wrench,
  AlertCircle,
  ShieldCheck,
  ClipboardList
} from "lucide-react";
import { useInventory } from "../context/InventoryContext";
import { useAuth } from "../context/AuthContext";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";

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
    calculateTotalStock,
    recordMaterialUsage
  } = useInventory();

  const { userProfile, userRole, isAdmin, isEngineer, assignedBranchId } = useAuth();

  // Selected branch can be from query params or context
  const activeBranch = branchParam || selectedBranchId || "all";
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Material Usage Modal State
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [usageProduct, setUsageProduct] = useState(null);
  const [usageBranchId, setUsageBranchId] = useState("");
  const [usageQuantity, setUsageQuantity] = useState(1);
  const [usageDescription, setUsageDescription] = useState("");
  const [usageError, setUsageError] = useState("");
  const [usageSuccess, setUsageSuccess] = useState(null);

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

  // Open Usage Modal
  const handleOpenUsageModal = (product = null, preferredBranch = null) => {
    setUsageError("");
    setUsageSuccess(null);
    setUsageProduct(product || products[0] || null);

    // If engineer, always locked to assignedBranchId
    if (isEngineer && assignedBranchId) {
      setUsageBranchId(assignedBranchId);
    } else {
      // Main Admin: can use preferredBranch if valid branch, otherwise activeBranch or first branch
      const validBranch =
        preferredBranch && preferredBranch !== "all"
          ? preferredBranch
          : activeBranch !== "all"
          ? activeBranch
          : branches[0]?.id || "loc_gazaria_230";
      setUsageBranchId(validBranch);
    }
    setUsageQuantity(1);
    setUsageDescription("Substation electrical maintenance & deployment");
    setIsUsageModalOpen(true);
  };

  // Submit Material Usage
  const handleRecordUsageSubmit = (e) => {
    e.preventDefault();
    setUsageError("");

    if (!usageProduct) {
      setUsageError("Please select a product.");
      return;
    }

    const targetBranch = isEngineer ? assignedBranchId : usageBranchId;
    if (!targetBranch) {
      setUsageError("Please select a substation branch.");
      return;
    }

    const availableStock = getProductStockInBranch(usageProduct, targetBranch);
    const qty = Number(usageQuantity);
    if (!qty || qty <= 0 || !Number.isInteger(qty)) {
      setUsageError("Please enter a valid positive integer quantity.");
      return;
    }

    if (qty > availableStock) {
      setUsageError(
        `Insufficient stock! Available in this substation is ${availableStock} ${usageProduct.unit}.`
      );
      return;
    }

    try {
      const res = recordMaterialUsage({
        productId: usageProduct.id,
        branchId: targetBranch,
        quantity: qty,
        taskDescription: usageDescription,
        user: userProfile
      });

      setUsageSuccess(res);
      setTimeout(() => {
        setIsUsageModalOpen(false);
        setUsageSuccess(null);
      }, 1600);
    } catch (err) {
      setUsageError(err.message || "Failed to record material usage.");
    }
  };

  // Calculate available stock for the currently selected product and branch in modal
  const modalTargetBranch = isEngineer ? assignedBranchId : usageBranchId;
  const modalAvailableStock = usageProduct && modalTargetBranch
    ? getProductStockInBranch(usageProduct, modalTargetBranch)
    : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Branch Inventory Matrix</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time stock balance tracking per substation depot, project site, and regional warehouse.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Record Usage Button */}
          <button
            onClick={() => handleOpenUsageModal(null, activeBranch)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition shadow-xs cursor-pointer"
          >
            <Wrench className="w-4 h-4" />
            <span>Use in Work (কাজে ব্যবহার)</span>
          </button>

          {/* New Stock Transfer */}
          <Link
            to="/stock-transfer"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-xs"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>New Stock Transfer</span>
          </Link>
        </div>
      </div>

      {/* Branch Tabs Filter */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => handleBranchTabChange("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
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
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
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
                <th className="py-3.5 px-4 text-center">Operations</th>
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
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Use in Work / কাজে ব্যবহার Button */}
                        <button
                          onClick={() => handleOpenUsageModal(prod, activeBranch)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition cursor-pointer"
                          title="Record In-Use for Substation Work (কাজে ব্যবহার)"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Use in Work</span>
                        </button>

                        {/* Dispatch Button */}
                        <Link
                          to={`/stock-transfer?product=${prod.id}&source=${activeBranch === "all" ? (branches.find(b => b.isMain)?.id || "loc_gazaria_230") : activeBranch}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition"
                          title="Transfer to another substation"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>Dispatch</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Material Usage ("In Use This Branch" / কাজে ব্যবহার) Modal */}
      <Modal
        isOpen={isUsageModalOpen}
        onClose={() => setIsUsageModalOpen(false)}
        title="Record Material Usage (কাজে ব্যবহার)"
        subtitle="Deduct inventory for substation installation, maintenance, or internal deployment"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleRecordUsageSubmit} className="space-y-4">
          {usageError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{usageError}</span>
            </div>
          )}

          {usageSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <div>
                <p className="font-bold">Material Usage Recorded Successfully!</p>
                <p className="text-[11px] text-emerald-700">
                  Ref: <span className="font-mono font-bold">{usageSuccess.referenceNo}</span> | Tagged as{" "}
                  <strong>"In Use (This Branch)"</strong> in movement ledger.
                </p>
              </div>
            </div>
          )}

          {/* Substation Selection */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Substation Branch *</span>
              </label>
              {isEngineer ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Assigned Station (Locked)</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Main Admin (All Branches Accessible)
                </span>
              )}
            </div>

            <select
              value={modalTargetBranch}
              disabled={isEngineer}
              onChange={(e) => setUsageBranchId(e.target.value)}
              className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
                isEngineer ? "cursor-not-allowed bg-slate-100 text-slate-600" : ""
              }`}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.isMain ? `🏢 [MAIN] ${b.name}` : `⚡ ${b.name}`} ({b.code})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              {isEngineer
                ? "Branch Engineers are authorized to record material consumption solely for their assigned substation."
                : "Select the substation branch where materials are being consumed."}
            </p>
          </div>

          {/* Product Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Product *
            </label>
            <select
              value={usageProduct?.id || ""}
              onChange={(e) => {
                const found = products.find((p) => p.id === e.target.value);
                setUsageProduct(found);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — SKU: {p.sku} ({p.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Available Stock Indicator */}
          <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs">
            <span className="text-amber-900 font-medium">Available On-Hand Stock in Station:</span>
            <span className="font-mono font-bold text-amber-900 text-sm">
              {modalAvailableStock} {usageProduct?.unit}
            </span>
          </div>

          {/* Quantity to Use */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Quantity Consumed / In-Use *
            </label>
            <input
              type="number"
              min="1"
              max={modalAvailableStock || 1}
              value={usageQuantity}
              onChange={(e) => setUsageQuantity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              placeholder="e.g. 5"
              required
            />
          </div>

          {/* Work / Task Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
              <span>Work / Maintenance Task Description (কাজের বিবরণ) *</span>
            </label>
            <textarea
              rows="3"
              value={usageDescription}
              onChange={(e) => setUsageDescription(e.target.value)}
              placeholder="e.g. Transformer Bay-2 230KV terminal maintenance and grounding cable connection."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUsageModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalAvailableStock <= 0}
              className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
                modalAvailableStock <= 0
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Confirm & Deduct Stock</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}