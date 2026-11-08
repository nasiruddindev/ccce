import React, { useState, useEffect } from "react";
import { X, ClipboardCheck, Check, AlertCircle, Wrench, Building2, Sparkles } from "lucide-react";
import { useInventory } from "../context/InventoryContext";

export default function RecordUsageModal({ isOpen, onClose, initialProduct, initialLocationId }) {
  const { products, branches, recordSiteUsage, userRole } = useInventory();

  const siteBranches = branches.filter((b) => !b.isMain);

  const [locationId, setLocationId] = useState(initialLocationId || siteBranches[0]?.id || "");
  const [productId, setProductId] = useState(initialProduct?.id || products[0]?.id || "");
  const [quantity, setQuantity] = useState(10);
  const [workDescription, setWorkDescription] = useState("");
  const [reportedBy, setReportedBy] = useState(userRole.name);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync props when modal opens
  useEffect(() => {
    if (initialProduct) {
      setProductId(initialProduct.id);
    }
    if (initialLocationId && initialLocationId !== "all") {
      setLocationId(initialLocationId);
    } else if (siteBranches.length > 0 && !locationId) {
      setLocationId(siteBranches[0]?.id);
    }
  }, [initialProduct, initialLocationId, isOpen]);

  if (!isOpen) return null;

  const selectedProduct = products.find((p) => p.id === productId);
  const selectedBranch = branches.find((b) => b.id === locationId);
  const availableAtSite = selectedProduct?.stock?.[locationId] || 0;
  const numQuantity = Number(quantity) || 0;
  const remainingAfter = Math.max(0, availableAtSite - numQuantity);

  const quickWorkPresets = [
    "Substation Panel Wiring",
    "Floor 3 Riser Cable Laying",
    "Distribution Board (DB-1) Connection",
    "Industrial Lighting Fixture Installation",
    "Grounding / Earthing Grid Setup",
    "Transformer HT Terminal Connection",
    "Cable Tray Routing & Fitting"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!locationId) {
      setErrorMsg("Please select a project site where the material was used.");
      return;
    }
    if (!productId) {
      setErrorMsg("Please select a product.");
      return;
    }
    if (numQuantity <= 0) {
      setErrorMsg("Please enter a valid quantity greater than zero.");
      return;
    }

    if (numQuantity > availableAtSite) {
      setErrorMsg(
        `Cannot deduct ${numQuantity} ${selectedProduct?.unit}. Only ${availableAtSite} ${selectedProduct?.unit} available at ${selectedBranch?.name}.`
      );
      return;
    }

    if (!workDescription.trim()) {
      setErrorMsg("Please provide a note of what work this product was used for on site.");
      return;
    }

    recordSiteUsage({
      locationId,
      locationName: selectedBranch.name,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      unit: selectedProduct.unit,
      quantity: numQuantity,
      workDescription: workDescription.trim(),
      reportedBy: reportedBy.trim() || userRole.name
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#161B23] border border-[#2B3547] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-[#242C3C] flex items-center justify-between bg-[#13171F]">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30 shrink-0">
              <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Record Site Material Usage (কাজে খরচ করা)
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                Deduct installed materials and record task details
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 text-xs overflow-y-auto flex-1">
          
          {errorMsg && (
            <div className="bg-rose-500/15 border border-rose-500/30 p-3 rounded-xl flex items-start gap-2 text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Project Site Selector */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Project Site Where Material Was Used *
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl px-3 py-2 text-white font-medium focus:outline-none cursor-pointer"
            >
              {siteBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  📍 {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          {/* Product Selector */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Electrical Material *
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer"
            >
              {products.map((p) => {
                const siteStock = p.stock?.[locationId] || 0;
                return (
                  <option key={p.id} value={p.id}>
                    {p.name} — (Site Stock: {siteStock} {p.unit})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Quantity & Stock Impact Card */}
          <div className="bg-[#11141B] p-3.5 rounded-xl border border-[#262F3E] space-y-2.5">
            <div className="flex justify-between items-center">
              <label className="text-slate-300 font-semibold">
                Quantity Used / Finished ({selectedProduct?.unit || "Units"}) *
              </label>
              <span className="text-[11px] text-slate-400">
                Currently at Site: <strong className="text-white font-mono">{availableAtSite} {selectedProduct?.unit}</strong>
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                min="1"
                max={availableAtSite}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-[#1A202C] border border-[#2E3848] focus:border-orange-500 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                {selectedProduct?.unit}
              </span>
            </div>

            {/* Live calculation banner */}
            <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400 border-t border-[#1F2734]">
              <span>Before: <strong className="text-slate-200">{availableAtSite}</strong></span>
              <span className="text-orange-400 font-semibold">- {numQuantity} used</span>
              <span>Remaining After: <strong className={`font-mono font-bold ${remainingAfter === 0 ? "text-amber-400" : "text-emerald-400"}`}>{remainingAfter} {selectedProduct?.unit}</strong></span>
            </div>
          </div>

          {/* Work Description / Task Note */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300 font-semibold">
                Work / Installation Note (কোন কাজে লেগেছে) *
              </label>
            </div>
            <textarea
              rows={3}
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              placeholder="e.g. Connected to Main Control Panel Room breaker; wiring completed up to DB-2..."
              className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl p-3 text-white focus:outline-none text-xs"
              required
            ></textarea>

            {/* Quick preset chips */}
            <div className="mt-2">
              <p className="text-[10px] text-slate-400 uppercase font-mono font-bold mb-1.5">
                Quick Preset Work Descriptions:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {quickWorkPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setWorkDescription(preset)}
                    className="text-[10px] bg-[#1E2532] hover:bg-orange-600/20 hover:text-orange-300 text-slate-300 px-2 py-1 rounded-lg border border-[#2B3545] transition cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reported By */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Reported By (Site Engineer / Supervisor)
            </label>
            <input
              type="text"
              value={reportedBy}
              onChange={(e) => setReportedBy(e.target.value)}
              className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#232B3B] flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-slate-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={availableAtSite <= 0}
              className={`flex items-center gap-1.5 font-semibold px-5 py-2.5 rounded-xl shadow-lg transition cursor-pointer ${
                availableAtSite > 0
                  ? "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-orange-950/40 border border-orange-400/30"
                  : "bg-slate-700 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Deduct from Site & Save Note</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
