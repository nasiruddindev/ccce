import React, { useState } from "react";
import { 
  X, 
  Truck, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Check, 
  ArrowRight,
  Building2,
  Calendar,
  Zap
} from "lucide-react";
import { useInventory } from "../context/InventoryContext";

export default function NewTransferModal({ isOpen, onClose, initialSelectedProduct, onTransferSuccess }) {
  const { products, branches, createTransfer, userRole } = useInventory();

  // Destination sites (excluding main warehouse)
  const destinationBranches = branches.filter((b) => !b.isMain);

  const [toLocationId, setToLocationId] = useState(destinationBranches[0]?.id || "");
  const [vehicleNo, setVehicleNo] = useState("Dhaka Metro TA-14-7740");
  const [driverName, setDriverName] = useState("Md. Karim Ullah");
  const [driverPhone, setDriverPhone] = useState("+880 1712-334455");
  const [notes, setNotes] = useState("");

  // Items list
  const [items, setItems] = useState(() => {
    if (initialSelectedProduct) {
      return [
        {
          productId: initialSelectedProduct.id,
          quantity: 10
        }
      ];
    }
    return [
      {
        productId: products[0]?.id || "",
        quantity: 50
      }
    ];
  });

  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  // Add another item row
  const handleAddItemRow = () => {
    setItems([...items, { productId: products[0]?.id || "", quantity: 10 }]);
  };

  // Remove item row
  const handleRemoveItemRow = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Update item field
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  // Submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!toLocationId) {
      setErrorMessage("Please select a destination project site or branch.");
      return;
    }

    if (items.length === 0) {
      setErrorMessage("Please add at least one material to transfer.");
      return;
    }

    // Validate quantities against Main Warehouse stock
    const payloadItems = [];

    for (const item of items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) {
        setErrorMessage("Invalid product selected.");
        return;
      }

      const availableInMain = prod.stock?.loc_main || 0;
      const requestedQty = Number(item.quantity);

      if (!requestedQty || requestedQty <= 0) {
        setErrorMessage(`Please enter a valid positive quantity for "${prod.name}".`);
        return;
      }

      if (requestedQty > availableInMain) {
        setErrorMessage(
          `Insufficient stock in Main Warehouse for "${prod.name}". Available: ${availableInMain} ${prod.unit}, Requested: ${requestedQty} ${prod.unit}.`
        );
        return;
      }

      payloadItems.push({
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        unit: prod.unit,
        quantity: requestedQty
      });
    }

    const targetBranch = branches.find((b) => b.id === toLocationId);

    const newTransferData = {
      fromLocationId: "loc_main",
      fromLocationName: "Main Central Warehouse (Tejgaon)",
      toLocationId: targetBranch.id,
      toLocationName: targetBranch.name,
      vehicleNo: vehicleNo.trim(),
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim(),
      dispatchedBy: userRole.name,
      notes: notes.trim(),
      items: payloadItems
    };

    const created = createTransfer(newTransferData);
    if (onTransferSuccess) {
      onTransferSuccess(created);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#161B23] border border-[#2B3547] rounded-2xl w-full max-w-2xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#242C3C] flex items-center justify-between bg-[#13171F]">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-950/40 text-white border border-orange-400/40 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Create Delivery Challan (Dispatch)</h2>
              <p className="text-[11px] sm:text-xs text-slate-400">Dispatch materials from Main Warehouse to Site</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1E2532] hover:bg-[#2A3445] text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1">
          
          {errorMessage && (
            <div className="bg-rose-500/15 border border-rose-500/30 p-3 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Transfer Route */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#11141C] p-4 rounded-xl border border-[#232B3B]">
            <div>
              <label className="block text-[11px] uppercase font-mono font-bold text-slate-400 mb-1">
                Dispatching Origin
              </label>
              <div className="text-xs font-semibold text-white bg-[#1A202C] px-3 py-2 rounded-lg border border-[#2A3445] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span>Main Central Warehouse (Tejgaon Hub)</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-mono font-bold text-orange-400 mb-1">
                Destination Site / Branch *
              </label>
              <select
                value={toLocationId}
                onChange={(e) => setToLocationId(e.target.value)}
                className="w-full text-xs font-semibold text-white bg-[#1A202C] px-3 py-2 rounded-lg border border-orange-500/40 focus:border-orange-500 focus:outline-none cursor-pointer"
                required
              >
                {destinationBranches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-[#1A202C] text-white">
                    📍 {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transport Logistics Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-medium text-slate-400 mb-1">
                Vehicle / Truck Reg #
              </label>
              <input
                type="text"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                placeholder="e.g. Dhaka Metro TA-14-8890"
                className="w-full bg-[#11141C] border border-[#242C3C] focus:border-orange-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-medium text-slate-400 mb-1">
                Driver Name
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Driver full name"
                className="w-full bg-[#11141C] border border-[#242C3C] focus:border-orange-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-medium text-slate-400 mb-1">
                Driver Phone
              </label>
              <input
                type="text"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                placeholder="+880 17XX-XXXXXX"
                className="w-full bg-[#11141C] border border-[#242C3C] focus:border-orange-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Materials Selection (Multiple Line Items) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] uppercase font-mono font-bold text-slate-300">
                Materials to Dispatch ({items.length})
              </label>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Material</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {items.map((item, index) => {
                const selectedProd = products.find((p) => p.id === item.productId);
                const availableInMain = selectedProd?.stock?.loc_main || 0;

                return (
                  <div 
                    key={index}
                    className="bg-[#11141C] p-3 rounded-xl border border-[#232B3B] flex flex-col sm:flex-row items-center gap-3"
                  >
                    {/* Product Dropdown */}
                    <div className="flex-1 w-full">
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                        className="w-full text-xs text-white bg-[#1A202C] px-3 py-2 rounded-lg border border-[#2A3445] focus:border-orange-500 focus:outline-none"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Stock: {p.stock?.loc_main || 0} {p.unit})
                          </option>
                        ))}
                      </select>
                      <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                        <span>SKU: {selectedProd?.sku}</span>
                        <span>Available in Main: <strong className="text-orange-400">{availableInMain} {selectedProd?.unit}</strong></span>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="w-full sm:w-32">
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max={availableInMain}
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          className="w-full bg-[#1A202C] border border-[#2A3445] focus:border-orange-500 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none"
                          required
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                          {selectedProd?.unit}
                        </span>
                      </div>
                    </div>

                    {/* Delete button */}
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(index)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                        title="Remove row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-mono font-medium text-slate-400 mb-1">
              Challan Remarks / Project Instructions
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Urgent cables for 4th floor switchboard; verify seal before offloading..."
              className="w-full bg-[#11141C] border border-[#242C3C] focus:border-orange-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
            ></textarea>
          </div>

          {/* Footer CTA */}
          <div className="pt-3 border-t border-[#232B3B] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-[#202735] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-950/50 border border-orange-400/30 transition transform active:scale-95 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Confirm & Dispatch Challan</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
