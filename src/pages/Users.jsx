import React, { useState } from "react";
import {
  Users as UsersIcon,
  Plus,
  Search,
  Shield,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  Lock,
  UserX,
  UserCheck,
  AlertCircle,
  Edit2,
  History,
  RotateCcw,
  Calendar,
  ArrowRightLeft
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useInventory } from "../context/InventoryContext";
import { useToast } from "../context/ToastContext";
import { authService } from "../services/authService";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";

export default function Users() {
  const { userProfile, isAdmin } = useAuth();
  const { users, branches, transfers, addUser } = useInventory();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState(null);
  const [selectedUserForHistory, setSelectedUserForHistory] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "Branch Engineer",
    branchId: "loc_kaliakoir_230",
    phone: "",
    department: "Substation Protection & Testing"
  });

  const [editFormData, setEditFormData] = useState({
    fullName: "",
    phone: "",
    department: "",
    role: "Branch Engineer",
    branchId: "loc_gazaria_230"
  });

  const filteredUsers = users.filter((u) =>
    (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.role || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.branchName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle Add Engineer Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!isAdmin) {
      addToast("Unauthorized: Only an authorized Main Admin can provision users.", "error");
      return;
    }

    if (!newUser.fullName || !newUser.email || !newUser.branchId) {
      setErrorMessage("Please fill all required fields including assigned substation branch.");
      return;
    }

    const branch = branches.find((b) => b.id === newUser.branchId);

    setIsLoading(true);
    try {
      await authService.createEngineerAccount(userProfile, {
        ...newUser,
        branchName: branch?.name || "Assigned Substation"
      });

      addUser({
        id: `usr_${Date.now()}`,
        name: newUser.fullName,
        fullName: newUser.fullName,
        email: newUser.email,
        role: "Branch Engineer",
        branchId: newUser.branchId,
        branchName: branch?.name || "Assigned Substation",
        phone: newUser.phone || "+880 1700-000000",
        department: newUser.department,
        status: "Active",
        isActive: true,
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
      });

      addToast(`Engineer account for ${newUser.fullName} provisioned successfully!`, "success");
      setIsAddModalOpen(false);
      setNewUser({
        fullName: "",
        email: "",
        password: "",
        role: "Branch Engineer",
        branchId: "loc_kaliakoir_230",
        phone: "",
        department: "Substation Protection & Testing"
      });
    } catch (err) {
      setErrorMessage(err.message || "Failed to create user account.");
      addToast(err.message || "Failed to create user account.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Account Active/Disabled Status
  const handleToggleStatus = async (user) => {
    if (!isAdmin) {
      addToast("Unauthorized: Only Main Admin can activate/deactivate accounts.", "error");
      return;
    }

    const newStatus = user.status === "Active" || user.isActive !== false ? false : true;
    try {
      await authService.setUserActiveStatus(userProfile, user.id || user.uid, newStatus);
      user.status = newStatus ? "Active" : "Disabled";
      user.isActive = newStatus;
      addToast(`Account for ${user.fullName || user.name} is now ${newStatus ? "Active" : "Disabled"}.`, "info");
    } catch (err) {
      addToast(err.message || "Status update failed.", "error");
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (user) => {
    setSelectedUserToEdit(user);
    setEditFormData({
      fullName: user.fullName || user.name || "",
      phone: user.phone || "",
      department: user.department || "Substation Protection",
      role: user.role || "Branch Engineer",
      branchId: user.branchId || "loc_gazaria_230"
    });
    setIsEditModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedUserToEdit) return;
    const branch = branches.find((b) => b.id === editFormData.branchId);

    setIsLoading(true);
    try {
      await authService.updateUserRoleAndBranch(
        userProfile,
        selectedUserToEdit.id || selectedUserToEdit.uid,
        editFormData.role,
        editFormData.branchId,
        branch?.name || "Assigned Substation"
      );

      selectedUserToEdit.fullName = editFormData.fullName;
      selectedUserToEdit.name = editFormData.fullName;
      selectedUserToEdit.phone = editFormData.phone;
      selectedUserToEdit.department = editFormData.department;
      selectedUserToEdit.role = editFormData.role;
      selectedUserToEdit.branchId = editFormData.branchId;
      selectedUserToEdit.branchName = branch?.name || "Assigned Substation";

      addToast(`Updated details for ${editFormData.fullName}. Role: ${editFormData.role}, Station: ${branch?.name}.`, "success");
      setIsEditModalOpen(false);
    } catch (err) {
      addToast(err.message || "Failed to update user.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Open Transfer History Modal for an Engineer
  const handleOpenHistory = (user) => {
    setSelectedUserForHistory(user);
    setIsHistoryModalOpen(true);
  };

  // Compute transfers for selected engineer's branch
  const engineerTransfers = selectedUserForHistory
    ? transfers.filter(
        (t) =>
          t.fromLocationId === selectedUserForHistory.branchId ||
          t.toLocationId === selectedUserForHistory.branchId
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Users & Role Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Authorized administrative directory for power grid engineers and substation supervisors.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Provision New Engineer</span>
          </button>
        )}
      </div>

      {/* RBAC Security Policy Badge */}
      <div className="bg-slate-900 text-slate-300 rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">
              Enterprise Role-Based Access Control (RBAC) & Single Substation Constraint
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Every Branch Engineer is cryptographically constrained to exactly one assigned active substation and cannot perform administrative promotions or unauthorized cross-branch dispatches.
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or substation..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
          {filteredUsers.length} System Accounts
        </span>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">User Details</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Assigned Substation Branch</th>
                <th className="py-3.5 px-4">Contact Phone</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                {isAdmin && <th className="py-3.5 px-4 text-center">Admin Controls</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <UsersIcon className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="font-semibold text-slate-600">No users match your search</p>
                    <p className="text-[11px] text-slate-400">Try searching with a different keyword.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isUserActive = user.status === "Active" || (user.isActive !== false && user.status !== "Disabled");

                  return (
                    <tr key={user.id || user.uid} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {(user.fullName || user.name)?.[0] || "U"}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">
                              {user.fullName || user.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            user.role === "Main Admin"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          <span>{user.role}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate max-w-[200px]">{user.branchName || "Assigned Substation"}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {user.phone || "+880 1700-000000"}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <Badge variant={isUserActive ? "success" : "danger"} size="sm">
                          {isUserActive ? "Active" : "Disabled"}
                        </Badge>
                      </td>

                      {isAdmin && (
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View Transfer History for this Engineer's station */}
                            <button
                              onClick={() => handleOpenHistory(user)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                              title="View Engineer Transfer History"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Information & Station */}
                            <button
                              onClick={() => handleOpenEdit(user)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                              title="Edit Engineer Details & Assigned Station"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Toggle Active / Disabled */}
                            {user.role !== "Main Admin" && (
                              <button
                                onClick={() => handleToggleStatus(user)}
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition cursor-pointer border ${
                                  isUserActive
                                    ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                }`}
                                title={isUserActive ? "Disable account" : "Enable account"}
                              >
                                {isUserActive ? "Disable" : "Enable"}
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Provision Branch Engineer Account"
        subtitle="Only authorized Main Admins can create and assign engineers to specific substations."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={newUser.fullName}
              onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
              placeholder="e.g. Engr. Arifur Rahman"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email Address *
              </label>
              <input
                type="email"
                required
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="arif.engineer@voltflow.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Temporary Password
              </label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="Leave blank for default"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Role Permission (Enforced)
              </label>
              <input
                type="text"
                disabled
                value="Branch Engineer"
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Engineers cannot self-promote to Administrative roles.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Substation Branch (Single Station Mandatory) *
              </label>
              <select
                required
                value={newUser.branchId}
                onChange={(e) => setNewUser({ ...newUser, branchId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    ⚡ {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                placeholder="+880 1700-000000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={newUser.department}
                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                placeholder="e.g. 230kV Relay Protection"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Provisioning..." : "Provision Account"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Information & Station Assignment Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit User: ${selectedUserToEdit?.fullName || selectedUserToEdit?.name}`}
        subtitle="Update engineer details, contact information, role, or station assignment."
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={editFormData.fullName}
                onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                value={editFormData.department}
                onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                User Role
              </label>
              <select
                value={editFormData.role}
                onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Main Admin">Main Admin (Full Access)</option>
                <option value="Branch Engineer">Branch Engineer (Restricted to Substation)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned Substation Branch (Single Station Mandatory)
            </label>
            <select
              value={editFormData.branchId}
              onChange={(e) => setEditFormData({ ...editFormData, branchId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.isMain ? `🏢 [MAIN] ${b.name}` : `⚡ ${b.name}`} ({b.code})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Engineer Transfer History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`Transfer History: ${selectedUserForHistory?.fullName || selectedUserForHistory?.name}`}
        subtitle={`All dispatched and received stock movements for assigned branch (${selectedUserForHistory?.branchName}).`}
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400">Assigned Substation:</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedUserForHistory?.branchName}</p>
            </div>
            <div className="text-right">
              <span className="text-slate-400">Total Challans:</span>
              <p className="font-bold text-blue-600 text-sm mt-0.5">{engineerTransfers.length}</p>
            </div>
          </div>

          <div className="overflow-x-auto max-h-72">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Challan No</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Route</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {engineerTransfers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No transfer movements recorded for this station yet.
                    </td>
                  </tr>
                ) : (
                  engineerTransfers.map((t) => {
                    const isOutgoing = t.fromLocationId === selectedUserForHistory?.branchId;

                    return (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{t.challanNo}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              isOutgoing
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {isOutgoing ? "Dispatched" : "Received"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {isOutgoing ? `To: ${t.toLocationName}` : `From: ${t.fromLocationName}`}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{t.items?.length || 0} items</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                          {new Date(t.date).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setIsHistoryModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
