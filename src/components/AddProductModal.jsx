import React, { useState } from "react";
import { X, Plus, Boxes, Zap } from "lucide-react";
import { useInventory } from "../context/InventoryContext";

export default function AddProductModal({ isOpen, onClose }) {
  const { addProduct } = useInventory();

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "Cables & Wires",
    unit: "Meters",
    minAlertLevel: 100,
    unitPrice: 50,
    initialStock: 500,
    specs: ""
  });

  if (!isOpen) return null;

  const categories = [
    "Cables & Wires",
    "Switchgear & Breakers",
    "Cable Trays & Conduits",
    "Distribution Boards",
    "Lighting & Fixtures",
    "Earthing & Protection",
    "Transformers & Heavy Equipment",
    "General Electrical"
  ];

  const units = ["Meters", "Pcs", "Sets", "Lengths (2.5m)", "Bundles (10pcs)", "Coils", "Units"];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    addProduct(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#161B23] border border-[#2B3547] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-[#242C3C] flex items-center justify-between bg-[#13171F]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Boxes className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">Add New Electrical Product</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Product Name & Grade *</label>
            <input
              type="text"
              required
              placeholder="e.g. NYY 1x35 rm Cable, ABB 100A Breaker..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">SKU / Item Code</label>
              <input
                type="text"
                placeholder="e.g. CBL-NYY-35"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl px-3 py-2 text-white focus:outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl px-2.5 py-2 text-white focus:outline-none cursor-pointer"
              >
                {units.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Main Whse Stock</label>
              <input
                type="number"
                min="0"
                value={formData.initialStock}
                onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Low Stock Alert</label>
              <input
                type="number"
                min="1"
                value={formData.minAlertLevel}
                onChange={(e) => setFormData({ ...formData, minAlertLevel: e.target.value })}
                className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Technical Specs & Standards</label>
            <input
              type="text"
              placeholder="e.g. 600/1000V, IEC 60502, BDS 901, Copper Core"
              value={formData.specs}
              onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
              className="w-full bg-[#11141B] border border-[#273142] focus:border-orange-500 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#232B3B] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold px-4 py-2 rounded-xl shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Save Product</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
