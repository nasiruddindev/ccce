import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRightLeft,
  Search,
  Filter,
  FileText,
  Printer,
  CheckCircle2,
  Clock,
  Eye,
  Plus
} from "lucide-react";
import { useInventory } from "../context/InventoryContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";

export default function TransferHistory() {
  const { transfers, markTransferReceived } = useInventory();
  const { userProfile, isAdmin, isEngineer } = useAuth();
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);

  const handleReceive = (transfer) => {
    // Role check: Only Main Admin or Engineer assigned to destination substation can receive
    if (!isAdmin && isEngineer && transfer.toLocationId !== userProfile?.branchId) {
      addToast(
        `Permission Denied: This shipment is designated for '${transfer.toLocationName}'. You can only confirm receipt for your assigned substation.`,
        "error"
      );
      return;
    }

    markTransferReceived(transfer.id);
    addToast(`Delivery confirmed for Challan ${transfer.challanNo}. Stock credited to ${transfer.toLocationName}.`, "success");
  };

  const filteredTransfers = transfers.filter((t) => {
    const matchesSearch =
      t.challanNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.fromLocationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.toLocationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.vehicleNo && t.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenChallan = (transfer) => {
    setSelectedTransfer(transfer);
    setIsChallanModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stock Transfer History</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete registry of inter-branch material challans, dispatches, and transit logs.
          </p>
        </div>
        <Link
          to="/stock-transfer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>New Stock Transfer</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Challan No, branch name, or vehicle number..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Statuses ({transfers.length})</option>
            <option value="in_transit">In Transit Only</option>
            <option value="received">Received / Completed</option>
          </select>
        </div>
      </div>

      {/* Transfers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Challan No</th>
                <th className="py-3.5 px-4">Dispatch Route</th>
                <th className="py-3.5 px-4">Items Consigned</th>
                <th className="py-3.5 px-4">Transport / Vehicle</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Date</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransfers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleOpenChallan(t)}
                      className="font-mono font-bold text-blue-600 hover:underline flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{t.challanNo}</span>
                    </button>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      By: {t.dispatchedBy}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{t.fromLocationName}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      &rarr; <span className="text-slate-600 font-medium">{t.toLocationName}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-700">
                      {t.items?.[0]?.productName || "Electrical Equipment"}
                    </div>
                    {t.items?.length > 1 && (
                      <span className="text-[10px] text-blue-600 font-bold">
                        +{t.items.length - 1} more item(s)
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-mono text-[11px] text-slate-700">{t.vehicleNo || "N/A"}</div>
                    <div className="text-[10px] text-slate-400">{t.driverName}</div>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <Badge variant={t.status === "in_transit" ? "warning" : "success"} size="sm">
                      {t.status === "in_transit" ? "In Transit" : "Received"}
                    </Badge>
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-slate-500">
                    {new Date(t.date).toLocaleDateString()}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenChallan(t)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                        title="View Challan Voucher"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {t.status === "in_transit" && (
                        <button
                          onClick={() => handleReceive(t)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                            isAdmin || t.toLocationId === userProfile?.branchId
                              ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          }`}
                          title={
                            isAdmin || t.toLocationId === userProfile?.branchId
                              ? "Confirm Delivery Receipt"
                              : "Only the destination substation engineer can receive this shipment"
                          }
                        >
                          Receive
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Challan View Modal */}
      {selectedTransfer && (
        <Modal
          isOpen={isChallanModalOpen}
          onClose={() => setIsChallanModalOpen(false)}
          title={`Delivery Challan: ${selectedTransfer.challanNo}`}
          subtitle="Official Gate Pass & Material Transfer Voucher"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs">
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    VOLTFLOW ELECTRICAL INDUSTRIES LTD.
                  </h3>
                  <p className="text-[11px] text-slate-500">Logistics & Supply Chain Division</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-extrabold text-blue-700">
                    {selectedTransfer.challanNo}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Date: {new Date(selectedTransfer.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Dispatch From</p>
                  <p className="font-bold text-slate-800">{selectedTransfer.fromLocationName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Consigned To</p>
                  <p className="font-bold text-slate-800">{selectedTransfer.toLocationName}</p>
                </div>
              </div>

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
                    {selectedTransfer.items?.map((item, idx) => (
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

              <div className="pt-2">
                <p className="text-[11px] text-slate-500 italic">
                  <strong>Notes:</strong> {selectedTransfer.notes || "None recorded."}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                <Printer className="w-4 h-4" />
                <span>Print Challan</span>
              </button>

              <button
                type="button"
                onClick={() => setIsChallanModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
