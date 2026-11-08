import React, { useState } from "react";
import { X, PackagePlus, Check } from "lucide-react";
import { useInventory } from "../context/InventoryContext";

export default function StockInModal({ isOpen, onClose }) {
  const { products, adjustStock, branches } = useInventory();

  const [productId, setProductId] = useState(products[0]?.id || "");
  const [quantity, setQuantity] = useState(100);
  const [targetLocationId, setTargetLocationId] = useState("loc_main");
  const [notes, setNotes] = useState("Supplier delivery received");

  if (!isOpen) return null;

  const selectedProduct = products.find((p) => p.id === productId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productId || Number(quantity) <= 0) return;

    adjustStock(productId, targetLocationId, Number(quantity), notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#161B23] border border-[#2B3547] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
        
        <div className="p-3.5 sm:p-4 border-b border-[#242C3C] flex items-center justify-between bg-[#13171F]">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
              <PackagePlus className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white">Stock In / Restock</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 text-xs overflow-y-auto flex-1">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Select Location to Receive</label>
            <select
              value={targetLocationId}
              onChange={(e) => setTargetLocationId(e.target.value)}
              className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl px-3 py-2 text-white focus:outline-none"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.isMain ? `🏢 [MAIN] ${b.name}` : `📍 ${b.name}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Electrical Material</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl px-3 py-2 text-white focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Quantity to Add ({selectedProduct?.unit || "Units"})
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Supplier / PO Reference</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. BRB Cable Delivery Challan #8841"
              className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#232B3B] flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold px-4 py-2 rounded-xl shadow-md cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Add to Stock</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
