import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Eye,
  Boxes,
  ArrowRightLeft,
  Phone,
  Mail,
  UserCheck,
  Edit2,
  Power,
  AlertTriangle,
  RotateCcw,
  ShieldAlert
} from "lucide-react";
import { useInventory } from "../context/InventoryContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { branchService } from "../services/branchService";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";

export default function AllBranches() {
  const { branches, getBranchStats, addBranch } = useInventory();
  const { userProfile, isAdmin } = useAuth();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [newBranch, setNewBranch] = useState({
    name: "",
    code: "",
    type: "Substation Site Store",
    location: "",
    address: "",
    inCharge: "",
    phone: "",
    email: "",
    capacity: "15,000 sq ft"
  });

  const [editBranch, setEditBranch] = useState({
    id: "",
    name: "",
    code: "",
    address: "",
    inCharge: "",
    phone: "",
    email: "",
    capacity: ""
  });

  const [typeFilter, setTypeFilter] = useState("all");

  const filteredBranches = branches.filter((b) => {
    const matchesSearch =
      (b.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.location || b.address || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.inCharge || b.contactPerson || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || (b.status || "Active") === statusFilter;
    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "main" && b.isMain) ||
      (typeFilter === "sub" && !b.isMain);

    return matchesSearch && matchesStatus && matchesType;
  });

  // Handle Add Branch
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      addToast("Unauthorized: Only Main Admin can register new branches.", "error");
      return;
    }

    if (!newBranch.name || !newBranch.code) {
      addToast("Branch name and branch code are mandatory.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const cleanCode = newBranch.code.trim().toUpperCase();
      const isUnique = await branchService.isBranchCodeUnique(cleanCode);
      if (!isUnique) {
        addToast(`Duplicate Code Error: Branch code '${cleanCode}' is already registered.`, "error");
        setIsLoading(false);
        return;
      }

      const created = await branchService.createBranch(userProfile, {
        branchName: newBranch.name,
        branchCode: cleanCode,
        address: newBranch.address || newBranch.location,
        contactPerson: newBranch.inCharge,
        phone: newBranch.phone,
        email: newBranch.email,
        capacity: newBranch.capacity
      });

      if (addBranch) {
        addBranch({
          id: created.branchId || created.id,
          name: created.branchName,
          code: created.branchCode,
          type: "Substation Site Store",
          location: created.address,
          address: created.address,
          inCharge: created.contactPerson,
          phone: created.phone,
          email: created.email,
          capacity: created.capacity,
          isMain: false,
          status: "Active"
        });
      } else {
        branches.push({
          id: created.branchId || created.id,
          name: created.branchName,
          code: created.branchCode,
          type: "Substation Site Store",
          location: created.address,
          address: created.address,
          inCharge: created.contactPerson,
          phone: created.phone,
          email: created.email,
          capacity: created.capacity,
          isMain: false,
          status: "Active"
        });
      }

      addToast(`Substation branch '${created.branchName}' (${cleanCode}) registered successfully.`, "success");
      setIsAddModalOpen(false);
      setNewBranch({
        name: "",
        code: "",
        type: "Substation Site Store",
        location: "",
        address: "",
        inCharge: "",
        phone: "",
        email: "",
        capacity: "15,000 sq ft"
      });
    } catch (err) {
      addToast(err.message || "Failed to create branch.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (branch) => {
    setSelectedBranch(branch);
    setEditBranch({
      id: branch.id || branch.branchId,
      name: branch.name || branch.branchName,
      code: branch.code || branch.branchCode,
      address: branch.address || branch.location || "",
      inCharge: branch.inCharge || branch.contactPerson || "",
      phone: branch.phone || "",
      email: branch.email || "",
      capacity: branch.capacity || "15,000 sq ft"
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      addToast("Unauthorized: Only Main Admin can edit branch details.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const cleanCode = editBranch.code.trim().toUpperCase();
      const isUnique = await branchService.isBranchCodeUnique(cleanCode, editBranch.id);
      if (!isUnique) {
        addToast(`Duplicate Code Error: Another branch already uses code '${cleanCode}'.`, "error");
        setIsLoading(false);
        return;
      }

      await branchService.updateBranch(userProfile, editBranch.id, {
        branchName: editBranch.name,
        branchCode: cleanCode,
        address: editBranch.address,
        contactPerson: editBranch.inCharge,
        phone: editBranch.phone,
        email: editBranch.email,
        capacity: editBranch.capacity
      });

      const target = branches.find((b) => (b.id || b.branchId) === editBranch.id);
      if (target) {
        target.name = editBranch.name;
        target.code = cleanCode;
        target.address = editBranch.address;
        target.location = editBranch.address;
        target.inCharge = editBranch.inCharge;
        target.phone = editBranch.phone;
        target.email = editBranch.email;
        target.capacity = editBranch.capacity;
      }

      addToast(`Branch '${editBranch.name}' updated successfully!`, "success");
      setIsEditModalOpen(false);
    } catch (err) {
      addToast(err.message || "Failed to update branch.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Branch Active / Inactive Status
  const handleToggleStatus = async (branch) => {
    if (!isAdmin) {
      addToast("Unauthorized: Only Main Admin can activate/deactivate branches.", "error");
      return;
    }

    const currentStatus = branch.status || "Active";
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";

    if (branch.isMain && nextStatus === "Inactive") {
      addToast("Action Denied: Central Grid Hub (Main Branch) cannot be deactivated.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await branchService.toggleBranchStatus(userProfile, branch.id || branch.branchId, nextStatus);
      branch.status = nextStatus;
      addToast(res.message, "info");
    } catch (err) {
      addToast(err.message || "Failed to update status.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Branches & Warehouse Sites</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage central depots, regional distribution hubs, and 11 Bangladesh Grid Substations.
          </p>
        </div>
        {isAdmin ? (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Branch</span>
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-medium">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            <span>Read-Only View</span>
          </span>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search branch name, code, in-charge engineer..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Types ({branches.length})</option>
            <option value="main">🏢 CCCE Main Branch</option>
            <option value="sub">⚡ Sub Branches (11 Substations)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active Locations</option>
            <option value="Inactive">Inactive Locations</option>
          </select>

          <div className="text-xs text-slate-500 whitespace-nowrap">
            Total: <strong className="text-slate-800">{branches.length}</strong> locations
          </div>
        </div>
      </div>

      {/* Branch Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Branch Name & Type</th>
                <th className="py-3.5 px-4">Branch Code</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 text-right">Total Products</th>
                <th className="py-3.5 px-4 text-right">Total Stock</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-600">No branches match your search</p>
                    <p className="text-[11px] text-slate-400">Try adjusting your search criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredBranches.map((branch) => {
                  const stats = getBranchStats(branch.id);
                  const isInactive = branch.status === "Inactive";

                  return (
                    <tr
                      key={branch.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isInactive ? "opacity-60 bg-slate-50/50" : ""
                      }`}
                    >
                      {/* Branch Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`p-2 rounded-xl shrink-0 ${
                              branch.isMain
                                ? "bg-blue-50 text-blue-600 border border-blue-200"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/branches/${branch.id}`}
                                className="font-bold text-slate-900 hover:text-blue-600 transition block truncate"
                              >
                                {branch.name}
                              </Link>
                              {branch.isMain ? (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 tracking-wide">
                                  🏢 MAIN BRANCH
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 tracking-wide">
                                  ⚡ SUB BRANCH
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              Lead: {branch.inCharge || branch.contactPerson || "Lead Station Engineer"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Branch Code */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {branch.code}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{branch.location || branch.address}</span>
                        </div>
                      </td>

                      {/* Total Products */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-slate-800">{stats.totalProducts}</span>
                        <span className="text-slate-400 text-[10px] ml-1">SKUs</span>
                      </td>

                      {/* Total Stock */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-blue-600">
                          {stats.totalStock.toLocaleString()}
                        </div>
                        <span className="text-slate-400 text-[10px]">units/m</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <Badge variant={branch.status === "Active" || !branch.status ? "success" : "neutral"} size="sm">
                          {branch.status || "Active"}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            to={`/branches/${branch.id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="View Branch Details & Assigned Engineers"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/branch-inventory?branch=${branch.id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="Inspect Branch Inventory"
                          >
                            <Boxes className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/stock-transfer?dest=${branch.id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                            title="Transfer Stock to Branch"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </Link>

                          {/* Admin-Only Edit */}
                          {isAdmin && (
                            <button
                              onClick={() => handleOpenEdit(branch)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                              title="Edit Branch Information"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Admin-Only Toggle Active/Inactive */}
                          {isAdmin && !branch.isMain && (
                            <button
                              onClick={() => handleToggleStatus(branch)}
                              className={`p-1.5 rounded-lg transition cursor-pointer ${
                                branch.status === "Inactive"
                                  ? "text-emerald-600 hover:bg-emerald-50"
                                  : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              }`}
                              title={branch.status === "Inactive" ? "Activate Branch" : "Deactivate Branch"}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Add Branch Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Branch / Substation"
        subtitle="Add a warehouse, distribution depot, or active power grid substation."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Branch / Substation Name *
              </label>
              <input
                type="text"
                required
                value={newBranch.name}
                onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                placeholder="e.g. Rampal 230 KV Substation"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Branch Code (Must be Unique) *
              </label>
              <input
                type="text"
                required
                value={newBranch.code}
                onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value.toUpperCase() })}
                placeholder="e.g. SUB-RAMPAL-230"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                In-Charge Lead Engineer
              </label>
              <input
                type="text"
                value={newBranch.inCharge}
                onChange={(e) => setNewBranch({ ...newBranch, inCharge: e.target.value })}
                placeholder="e.g. Engr. Tanvir Ahmed"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={newBranch.phone}
                onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                placeholder="+880 1700-000000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={newBranch.email}
                onChange={(e) => setNewBranch({ ...newBranch, email: e.target.value })}
                placeholder="rampal.substation@voltflow.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Facility Capacity
              </label>
              <input
                type="text"
                value={newBranch.capacity}
                onChange={(e) => setNewBranch({ ...newBranch, capacity: e.target.value })}
                placeholder="e.g. 15,000 sq ft"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Physical Location / Address
            </label>
            <input
              type="text"
              value={newBranch.address}
              onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
              placeholder="e.g. Rampal Power Plant Yard, Bagerhat, Khulna"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Saving..." : "Register Branch"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Branch Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Branch Information"
        subtitle="Update contact personnel, phone, and physical address."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Branch Name *
              </label>
              <input
                type="text"
                required
                value={editBranch.name}
                onChange={(e) => setEditBranch({ ...editBranch, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Branch Code *
              </label>
              <input
                type="text"
                required
                value={editBranch.code}
                onChange={(e) => setEditBranch({ ...editBranch, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                In-Charge Engineer
              </label>
              <input
                type="text"
                value={editBranch.inCharge}
                onChange={(e) => setEditBranch({ ...editBranch, inCharge: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={editBranch.phone}
                onChange={(e) => setEditBranch({ ...editBranch, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={editBranch.email}
                onChange={(e) => setEditBranch({ ...editBranch, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Storage Capacity
              </label>
              <input
                type="text"
                value={editBranch.capacity}
                onChange={(e) => setEditBranch({ ...editBranch, capacity: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Physical Location
            </label>
            <input
              type="text"
              value={editBranch.address}
              onChange={(e) => setEditBranch({ ...editBranch, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
