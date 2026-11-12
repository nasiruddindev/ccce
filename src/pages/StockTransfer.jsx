import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  ArrowRightLeft,
  Search,
  Building2,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  X,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { useInventory } from "../context/InventoryContext";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/common/Modal";

export default function StockTransfer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedProductId = searchParams.get("product");
  const preSelectedSource = searchParams.get("source");
  const preSelectedDest = searchParams.get("dest");

  const {
    branches,
    products,
    createTransfer,
    getProductStockInBranch
  } = useInventory();

  const { userProfile, userRole, isAdmin, isEngineer, assignedBranchId } = useAuth();

  // Enforce role rule: Branch Engineer can only transfer stock from their assigned branch
  const effectiveSource = isEngineer && assignedBranchId 
    ? assignedBranchId 
    : (preSelectedSource || branches.find((b) => b.isMain)?.id || branches[0]?.id || "loc_gazaria_230");

  const defaultDest = branches.find((b) => b.id !== effectiveSource)?.id || "loc_kobirpur_230";

  const [sourceBranchId, setSourceBranchId] = useState(effectiveSource);
  const [destinationBranchId, setDestinationBranchId] = useState(preSelectedDest || defaultDest);

  // Selected Product & Search
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(
    products.find((p) => p.id === preSelectedProductId) || null
  );

  // Quantity & Reference
  const [transferQuantity, setTransferQuantity] = useState(10);
  const [referenceNumber, setReferenceNumber] = useState(
    `CH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [notes, setNotes] = useState("Dispatched for site requirement & construction deployment.");

  // Transport details
  const [vehicleNo, setVehicleNo] = useState("Dhaka Metro TA-14-8890");
  const [driverName, setDriverName] = useState("Abul Kashem");
  const [driverPhone, setDriverPhone] = useState("+880 1722-114477");

  // Success / Challan Modal
  const [successTransfer, setSuccessTransfer] = useState(null);
  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Calculate available quantity in selected source branch
  const availableQuantity = selectedProduct
    ? getProductStockInBranch(selectedProduct, sourceBranchId)
    : 0;

  // Filter products for search dropdown
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedProduct) {
      setErrorMessage("Please select a product to transfer.");
      return;
    }

    if (sourceBranchId === destinationBranchId) {
      setErrorMessage("Source and destination branches cannot be the same.");
      return;
    }

    if (transferQuantity <= 0) {
      setErrorMessage("Transfer quantity must be greater than zero.");
      return;
    }

    if (transferQuantity > availableQuantity) {
      setErrorMessage(
        `Insufficient stock! Available in source branch is ${availableQuantity} ${selectedProduct.unit}.`
      );
      return;
    }

    const sourceBranch = branches.find((b) => b.id === sourceBranchId);
    const destBranch = branches.find((b) => b.id === destinationBranchId);

    const transferPayload = {
      challanNo: referenceNumber,
      fromLocationId: sourceBranchId,
      fromLocationName: sourceBranch?.name || "Main Warehouse",
      toLocationId: destinationBranchId,
      toLocationName: destBranch?.name || "Site Depot",
      vehicleNo,
      driverName,
      driverPhone,
      dispatchedBy: userProfile?.fullName || userProfile?.name || "Station Lead",
      notes,
      items: [
        {
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          sku: selectedProduct.sku,
          unit: selectedProduct.unit,
          quantity: Number(transferQuantity)
        }
      ]
    };

    const created = createTransfer(transferPayload);
    setSuccessTransfer(created);
    setIsChallanModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Create Stock Transfer & Challan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Initiate inter-branch dispatch, issue official gate-pass challan, and schedule material transit.
        </p>
      </div>

      {/* Main Transfer Form Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Route Selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Transfer Route (Source & Destination)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Source Branch */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Source Branch (Dispatch From) *</span>
                  </label>
                  {isEngineer && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Assigned Station (Locked)
                    </span>
                  )}
                </div>
                <select
                  value={sourceBranchId}
                  disabled={isEngineer}
                  onChange={(e) => setSourceBranchId(e.target.value)}
                  className={`w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    isEngineer ? "cursor-not-allowed bg-slate-100 text-slate-600" : ""
                  }`}
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.isMain ? `🏢 [MAIN] ${b.name}` : `⚡ ${b.name}`} ({b.code})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  {isEngineer 
                    ? "Branch Engineers are authorized to dispatch materials only from their assigned station."
                    : "Stock will be deducted from this depot."}
                </p>
              </div>

              {/* Destination Branch */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>Destination Branch (Receive At) *</span>
                </label>
                <select
                  value={destinationBranchId}
                  onChange={(e) => setDestinationBranchId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} disabled={b.id === sourceBranchId}>
                      {b.name} ({b.code}) {b.id === sourceBranchId ? "(Source)" : ""}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Site or regional depot to receive shipment.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Product Search & Quantity */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Electrical Product & Quantity
            </h3>

            {/* Product Selector / Search */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Product Search & Select *
              </label>

              {selectedProduct ? (
                <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-11 h-11 rounded-xl object-cover border border-blue-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900 truncate">
                        {selectedProduct.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        SKU: <strong className="font-mono text-blue-700">{selectedProduct.sku}</strong> &bull; Brand: {selectedProduct.brand}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProduct(null);
                      setIsSearchOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white transition"
                    title="Change Product"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={productSearchQuery}
                    onChange={(e) => {
                      setProductSearchQuery(e.target.value);
                      setIsSearchOpen(true);
                    }}
                    onFocus={() => setIsSearchOpen(true)}
                    placeholder="Type cable size, breaker brand, or SKU code..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />

                  {/* Dropdown Options */}
                  {isSearchOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-20 divide-y divide-slate-100">
                      {filteredProducts.map((p) => {
                        const stockInSrc = getProductStockInBranch(p, sourceBranchId);

                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              setSelectedProduct(p);
                              setIsSearchOpen(false);
                            }}
                            className="p-3 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{p.name}</p>
                              <p className="text-[11px] text-slate-400 font-mono">
                                {p.sku} &bull; {p.brand}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-semibold text-slate-700">
                                {stockInSrc} {p.unit}
                              </span>
                              <p className="text-[10px] text-slate-400">Available in Source</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Available vs Transfer Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-semibold uppercase text-slate-400">
                  Available in Selected Source
                </span>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">
                  {availableQuantity.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-slate-500">
                    {selectedProduct?.unit || "Units"}
                  </span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  From: {branches.find((b) => b.id === sourceBranchId)?.name}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Transfer Quantity *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={availableQuantity > 0 ? availableQuantity : 100000}
                    value={transferQuantity}
                    onChange={(e) => setTransferQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <span className="text-xs font-semibold text-slate-500 shrink-0">
                    {selectedProduct?.unit || "Units"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Must not exceed {availableQuantity} {selectedProduct?.unit || "Units"}.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Reference, Logistics & Notes */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3. Reference & Gate-Pass Logistics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reference / Challan No *
                </label>
                <input
                  type="text"
                  required
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vehicle / Transport No
                </label>
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Driver Name & Contact
                </label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="e.g. Abul Kashem"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dispatch Notes & Instructions
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Include safety handling instructions, handling supervisor remarks..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Form Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/transfer-history")}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Submit Transfer & Generate Challan</span>
            </button>
          </div>
        </form>
      </div>

      {/* Challan Preview Modal */}
      {successTransfer && (
        <Modal
          isOpen={isChallanModalOpen}
          onClose={() => {
            setIsChallanModalOpen(false);
            navigate("/transfer-history");
          }}
          title="Stock Transfer Challan Generated"
          subtitle="Official material dispatch voucher and delivery gate-pass."
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs">
              {/* Challan Top Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    VOLTFLOW ELECTRICAL INDUSTRIES LTD.
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Central Distribution & Projects Logistics Division
                  </p>
                  <p className="text-[10px] text-slate-400">Tejgaon Industrial Area, Dhaka-1208</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-extrabold text-blue-700">
                    {successTransfer.challanNo}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Date: {new Date(successTransfer.date).toLocaleDateString()}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    IN-TRANSIT
                  </span>
                </div>
              </div>

              {/* Route & Transport */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Dispatch From</p>
                  <p className="font-bold text-slate-800">{successTransfer.fromLocationName}</p>
                  <p className="text-[11px] text-slate-500">By: {successTransfer.dispatchedBy}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Consigned To</p>
                  <p className="font-bold text-slate-800">{successTransfer.toLocationName}</p>
                  <p className="text-[11px] text-slate-500">Transport: {successTransfer.vehicleNo}</p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                      <th className="pb-2">Item Description</th>
                      <th className="pb-2">SKU</th>
                      <th className="pb-2 text-right">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {successTransfer.items.map((item, idx) => (
                      <tr key={idx} className="py-2">
                        <td className="py-2 font-bold text-slate-800">{item.productName}</td>
                        <td className="py-2 font-mono text-slate-500">{item.sku}</td>
                        <td className="py-2 text-right font-bold text-blue-700">
                          {item.quantity} {item.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-3 gap-4 text-center text-[10px] text-slate-400">
                <div className="border-t border-slate-300 pt-1">Store Officer Signature</div>
                <div className="border-t border-slate-300 pt-1">Driver Signature</div>
                <div className="border-t border-slate-300 pt-1">Receiver Signature</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Gate Pass</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsChallanModalOpen(false);
                  navigate("/transfer-history");
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                Go to Transfer History &rarr;
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
