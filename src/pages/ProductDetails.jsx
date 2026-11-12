import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  ArrowRightLeft,
  Building2,
  Barcode,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  TrendingDown,
  TrendingUp,
  Tag,
  Wrench,
  AlertCircle,
  ClipboardList
} from "lucide-react";
import { useInventory } from "../context/InventoryContext";
import { useAuth } from "../context/AuthContext";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    products,
    branches,
    calculateTotalStock,
    getProductStatus,
    getProductStockInBranch,
    movements,
    recordMaterialUsage
  } = useInventory();

  const { userProfile, userRole, isAdmin, isEngineer, assignedBranchId } = useAuth();

  const product = products.find((p) => p.id === id) || products[0];

  // Material Usage Modal State
  const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
  const [usageBranchId, setUsageBranchId] = useState("");
  const [usageQuantity, setUsageQuantity] = useState(1);
  const [usageDescription, setUsageDescription] = useState("");
  const [usageError, setUsageError] = useState("");
  const [usageSuccess, setUsageSuccess] = useState(null);

  if (!product) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <Package className="w-12 h-12 mx-auto text-slate-400 mb-3" />
        <h3 className="text-base font-bold text-slate-800">Product Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">The requested product could not be found.</p>
        <Link
          to="/products"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
      </div>
    );
  }

  const totalStock = calculateTotalStock(product);
  const status = getProductStatus(product);
  const totalValuation = totalStock * (product.unitPrice || 0);

  // Filter movements for this product
  const productMovements = movements.filter(
    (m) => m.productId === product.id || m.productName?.includes(product.name?.substring(0, 10))
  );

  // Open Usage Modal
  const handleOpenUsageModal = (branchId = null) => {
    setUsageError("");
    setUsageSuccess(null);

    // If engineer, always locked to assignedBranchId
    if (isEngineer && assignedBranchId) {
      setUsageBranchId(assignedBranchId);
    } else {
      setUsageBranchId(branchId || branches[0]?.id || "loc_gazaria_230");
    }
    setUsageQuantity(1);
    setUsageDescription("Substation electrical maintenance & component replacement");
    setIsUsageModalOpen(true);
  };

  // Submit Usage
  const handleRecordUsageSubmit = (e) => {
    e.preventDefault();
    setUsageError("");

    const targetBranch = isEngineer ? assignedBranchId : usageBranchId;
    if (!targetBranch) {
      setUsageError("Please select a substation branch.");
      return;
    }

    const availableStock = getProductStockInBranch(product, targetBranch);
    const qty = Number(usageQuantity);
    if (!qty || qty <= 0 || !Number.isInteger(qty)) {
      setUsageError("Please enter a valid positive integer quantity.");
      return;
    }

    if (qty > availableStock) {
      setUsageError(`Insufficient stock! Available in this substation is ${availableStock} ${product.unit}.`);
      return;
    }

    try {
      const res = recordMaterialUsage({
        productId: product.id,
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

  const modalTargetBranch = isEngineer ? assignedBranchId : usageBranchId;
  const modalAvailableStock = modalTargetBranch ? getProductStockInBranch(product, modalTargetBranch) : 0;

  return (
    <div className="space-y-6">
      {/* Top Navigation Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => navigate("/products")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Use in Work / কাজে ব্যবহার button */}
          <button
            onClick={() => handleOpenUsageModal(isEngineer ? assignedBranchId : null)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
          >
            <Wrench className="w-4 h-4" />
            <span>Use in Work (কাজে ব্যবহার)</span>
          </button>

          {/* Dispatch button */}
          <Link
            to={`/stock-transfer?product=${product.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-xs"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Dispatch / Transfer</span>
          </Link>
        </div>
      </div>

      {/* Main Product Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Product Image & Badges */}
          <div className="space-y-4">
            <div className="aspect-square w-full rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400";
                }}
              />
              <div className="absolute top-3 left-3">
                <Badge
                  variant={status === "In Stock" ? "success" : status === "Low Stock" ? "warning" : "danger"}
                >
                  {status}
                </Badge>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Barcode className="w-4 h-4 text-slate-400" />
                <span className="font-mono text-slate-500">Barcode:</span>
              </div>
              <span className="font-mono font-bold text-slate-800">{product.barcode || "N/A"}</span>
            </div>
          </div>

          {/* Product Details & Specifications (2 cols) */}
          <div className="md:col-span-2 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {product.sku}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {product.category}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                  {product.brand}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {product.name}
              </h2>

              <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                <strong className="text-slate-800">Technical Specifications: </strong>
                {product.specs || "Standard industrial compliant electrical specifications."}
              </p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Stock</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">
                  {totalStock.toLocaleString()} <span className="text-xs text-slate-500 font-normal">{product.unit}</span>
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Unit Price</span>
                <p className="text-lg font-bold text-blue-600 mt-0.5">
                  ৳{product.unitPrice?.toLocaleString()}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Stock Valuation</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">
                  ৳{totalValuation.toLocaleString()}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Alert Level</span>
                <p className="text-lg font-bold text-amber-600 mt-0.5">
                  {product.minAlertLevel} <span className="text-xs text-slate-500 font-normal">{product.unit}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Branch Stock Breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Multi-Branch Distribution</h3>
            <p className="text-xs text-slate-500 mt-0.5">Current inventory levels allocated across each site warehouse</p>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            {branches.length} Active Branches
          </span>
        </div>

        <div className="divide-y divide-slate-100 mt-4">
          {branches.map((b) => {
            const qty = getProductStockInBranch(product, b.id);
            const percentage = totalStock > 0 ? Math.round((qty / totalStock) * 100) : 0;
            const canEngineerActOnThis = !isEngineer || b.id === assignedBranchId;

            return (
              <div key={b.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{b.name}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                      {b.code}
                    </span>
                    {b.isMain && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded">
                        Main Warehouse
                      </span>
                    )}
                    {isEngineer && b.id === assignedBranchId && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                        Your Station
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{b.location}</p>

                  {/* Stock progress bar */}
                  <div className="w-full sm:max-w-md bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        b.isMain ? "bg-blue-600" : "bg-indigo-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900">
                      {qty.toLocaleString()} {product.unit}
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium">{percentage}% of company stock</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Use in Work button */}
                    <button
                      onClick={() => handleOpenUsageModal(b.id)}
                      disabled={!canEngineerActOnThis || qty <= 0}
                      className={`p-1.5 rounded-lg transition ${
                        canEngineerActOnThis && qty > 0
                          ? "text-amber-700 bg-amber-50 hover:bg-amber-100 cursor-pointer"
                          : "text-slate-300 bg-slate-50 cursor-not-allowed"
                      }`}
                      title={
                        !canEngineerActOnThis
                          ? "Branch Engineers can only consume items at their assigned station"
                          : "Use in Work (কাজে ব্যবহার)"
                      }
                    >
                      <Wrench className="w-4 h-4" />
                    </button>

                    {/* Dispatch Link */}
                    <Link
                      to={`/stock-transfer?product=${product.id}&source=${b.id}&dest=${b.isMain ? (branches.find(x => !x.isMain)?.id || "") : (branches.find(x => x.isMain)?.id || "")}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                      title="Transfer from/to this substation"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Movement History for this product */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Movement & Dispatch History</h3>
          </div>
          <Link to="/stock-movements" className="text-xs text-blue-600 font-semibold hover:underline">
            View Full Audit Trail &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="pb-3">Reference No</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Source &rarr; Destination</th>
                <th className="pb-3 text-right">Quantity</th>
                <th className="pb-3">Handled By</th>
                <th className="pb-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productMovements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No recent movement records for this item.
                  </td>
                </tr>
              ) : (
                productMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-3 font-mono font-bold text-blue-600">{m.referenceNo}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                          m.type?.includes("In Use")
                            ? "bg-amber-100 text-amber-800 border border-amber-300 font-bold"
                            : m.type?.includes("In")
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {m.type}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600">
                      <div>
                        {m.sourceBranch} &rarr; {m.destinationBranch}
                      </div>
                      {m.reason && (
                        <div className="text-[10px] text-slate-400 italic">
                          Task: {m.reason}
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-right font-bold font-mono">
                      <span className={m.quantity < 0 ? "text-rose-600" : "text-emerald-600"}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity} {m.unit}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{m.performedBy}</td>
                    <td className="py-3 text-right text-slate-400 font-mono">
                      {new Date(m.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Material Usage Modal */}
      <Modal
        isOpen={isUsageModalOpen}
        onClose={() => setIsUsageModalOpen(false)}
        title="Record Material Usage (কাজে ব্যবহার)"
        subtitle={`Deduct on-hand stock for '${product.name}'`}
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

          {/* Available Stock Indicator */}
          <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs">
            <span className="text-amber-900 font-medium">Available On-Hand Stock in Station:</span>
            <span className="font-mono font-bold text-amber-900 text-sm">
              {modalAvailableStock} {product.unit}
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