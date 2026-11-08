import React from "react";
import { X, Printer, Zap, CheckCircle2, QrCode } from "lucide-react";

export default function ChallanModal({ transfer, isOpen, onClose }) {
  if (!isOpen || !transfer) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-[#161B23] border border-[#2E3747] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Top Bar (Hidden on print) */}
        <div className="p-4 border-b border-[#252C3B] flex items-center justify-between bg-[#13161E] no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
              Challan Preview
            </span>
            <span className="text-sm font-semibold text-white">{transfer.challanNo}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-md transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Challan / Gate Pass</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#1F2633] text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet (White paper styling for clean print!) */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-white text-slate-900 font-sans print:p-0">
          
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold">
                  ⚡
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                    VoltFlow CCC Electrical & Engineering Ltd.
                  </h1>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Plot 42, Tejgaon Industrial Area, Dhaka-1208 | Tel: +880 2-8877665
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono">
                Project Contracting • High Voltage Substation • Industrial Electrical Installation
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block bg-slate-900 text-white text-xs uppercase font-bold tracking-widest px-3 py-1 rounded">
                Delivery Challan & Gate Pass
              </span>
              <p className="font-mono text-sm font-bold text-slate-900 mt-1.5">
                Challan No: <span className="text-orange-600">{transfer.challanNo}</span>
              </p>
              <p className="text-[11px] text-slate-600">
                Date: {new Date(transfer.date).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Dispatch & Delivery Logistics Meta */}
          <div className="grid grid-cols-2 gap-6 my-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div>
              <p className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">
                DISPATCH FROM (CONSIGNOR):
              </p>
              <p className="font-bold text-slate-900">{transfer.fromLocationName}</p>
              <p className="text-slate-600 text-[11px]">Central Electrical Store & Logistics Hub</p>
              <p className="text-slate-600 text-[11px] mt-1">Dispatched By: {transfer.dispatchedBy || "Warehouse Lead"}</p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-mono font-bold text-slate-500 mb-1">
                DELIVER TO (CONSIGNEE):
              </p>
              <p className="font-bold text-slate-900">{transfer.toLocationName}</p>
              <p className="text-slate-600 text-[11px]">Designated Project Site</p>
              <p className="text-slate-600 text-[11px] mt-1">
                Status: <strong className={transfer.status === "received" ? "text-emerald-700" : "text-amber-700 font-semibold uppercase"}>
                  {transfer.status === "received" ? `Received by ${transfer.receivedBy || "Site Manager"}` : "In-Transit / En Route"}
                </strong>
              </p>
            </div>
          </div>

          {/* Vehicle / Carrier details */}
          <div className="flex justify-between items-center bg-slate-100 p-2.5 rounded border border-slate-200 text-xs mb-4">
            <div>
              <span className="text-slate-600">Vehicle / Truck No: </span>
              <strong className="font-mono text-slate-900">{transfer.vehicleNo || "Direct Company Transport"}</strong>
            </div>
            <div>
              <span className="text-slate-600">Driver Name: </span>
              <strong className="text-slate-900">{transfer.driverName || "Authorized Transporter"}</strong>
            </div>
            <div>
              <span className="text-slate-600">Contact: </span>
              <strong className="font-mono text-slate-900">{transfer.driverPhone || "N/A"}</strong>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-300 rounded overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
                  <th className="p-2.5 text-center w-10">#</th>
                  <th className="p-2.5">Item Description</th>
                  <th className="p-2.5">SKU / Code</th>
                  <th className="p-2.5 text-center">Unit</th>
                  <th className="p-2.5 text-right">Quantity Dispatched</th>
                  <th className="p-2.5 text-center">Site Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transfer.items.map((item, index) => (
                  <tr key={index} className="even:bg-slate-50">
                    <td className="p-2.5 text-center font-mono text-slate-500">{index + 1}</td>
                    <td className="p-2.5 font-semibold text-slate-900">{item.productName}</td>
                    <td className="p-2.5 font-mono text-slate-600 text-[11px]">{item.sku}</td>
                    <td className="p-2.5 text-center text-slate-600">{item.unit}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900 text-sm">
                      {item.quantity}
                    </td>
                    <td className="p-2.5 text-center text-slate-500">
                      {transfer.status === "received" ? "✓ Verified" : "[  ]"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Remarks */}
          {transfer.notes && (
            <div className="mt-3 text-xs text-slate-600 p-2.5 bg-slate-50 rounded border border-slate-200">
              <strong>Challan Notes:</strong> {transfer.notes}
            </div>
          )}

          {/* Signatures and Acceptance block */}
          <div className="grid grid-cols-4 gap-4 mt-16 pt-4 text-center text-xs border-t border-slate-300">
            <div>
              <div className="h-10"></div>
              <div className="border-t border-slate-400 pt-1">
                <p className="font-semibold text-slate-800">Store In-Charge</p>
                <p className="text-[10px] text-slate-500">Prepared By</p>
              </div>
            </div>

            <div>
              <div className="h-10"></div>
              <div className="border-t border-slate-400 pt-1">
                <p className="font-semibold text-slate-800">Warehouse Manager</p>
                <p className="text-[10px] text-slate-500">Authorized Dispatch</p>
              </div>
            </div>

            <div>
              <div className="h-10"></div>
              <div className="border-t border-slate-400 pt-1">
                <p className="font-semibold text-slate-800">Carrier / Driver</p>
                <p className="text-[10px] text-slate-500">Goods in Charge</p>
              </div>
            </div>

            <div>
              <div className="h-10">
                {transfer.status === "received" && (
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                    DIGITALLY VERIFIED
                  </span>
                )}
              </div>
              <div className="border-t border-slate-400 pt-1">
                <p className="font-semibold text-slate-800">Site In-Charge</p>
                <p className="text-[10px] text-slate-500">Received & Verified</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-[10px] text-slate-500 font-mono border-t border-slate-200 pt-2">
            This is an official VoltFlow CCC materials gate pass. Any discrepancies must be reported to Tejgaon Logistics within 24 hours.
          </div>

        </div>

      </div>
    </div>
  );
}
