import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Building2,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  Boxes,
  ArrowRightLeft,
  Calendar,
  Layers,
  Search,
  ExternalLink,
  Shield,
  Users as UsersIcon
} from "lucide-react";
import { useInventory } from "../context/InventoryContext";
import Badge from "../components/common/Badge";
import StatCard from "../components/common/StatCard";

export default function BranchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    branches,
    products,
    transfers,
    users,
    getProductStockInBranch,
    getProductStatus
  } = useInventory();

  const [activeTab, setActiveTab] = useState("inventory");
  const [searchTerm, setSearchTerm] = useState("");

  const branch = branches.find((b) => b.id === id) || branches[0];

  if (!branch) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <Building2 className="w-12 h-12 mx-auto text-slate-400 mb-3" />
        <h3 className="text-base font-bold text-slate-800">Branch Not Found</h3>
        <Link
          to="/branches"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Branches</span>
        </Link>
      </div>
    );
  }

  // Products available in this branch
  const branchProducts = products
    .map((p) => ({
      ...p,
      branchQty: getProductStockInBranch(p, branch.id)
    }))
    .filter((p) => p.branchQty > 0);

  const filteredBranchProducts = branchProducts.filter(
    (p) =>
      (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStockInBranch = branchProducts.reduce((sum, p) => sum + p.branchQty, 0);
  const totalValuation = branchProducts.reduce(
    (sum, p) => sum + p.branchQty * (p.unitPrice || 0),
    0
  );

  // Transfers involving this branch
  const branchTransfers = transfers.filter(
    (t) => t.fromLocationId === branch.id || t.toLocationId === branch.id
  );

  // Assigned Engineers for this branch
  const assignedEngineers = (users || []).filter(
    (u) => (u.branchId === branch.id || u.branchId === id) && u.role === "Branch Engineer"
  );

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/branches")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Branches</span>
        </button>

        <Link
          to={`/stock-transfer?dest=${branch.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-xs"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Dispatch Stock to This Branch</span>
        </Link>
      </div>

      {/* Branch Header Profile Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {branch.code}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {branch.type || "Substation Site Store"}
                </span>
                {branch.isMain && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    Central Distribution Hub
                  </span>
                )}
                <Badge variant={branch.status === "Active" || !branch.status ? "success" : "neutral"} size="sm">
                  {branch.status || "Active"}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{branch.name}</h1>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{branch.address || branch.location}</span>
              </p>
            </div>
          </div>

          {/* Quick Contact & Info */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-xs min-w-[240px]">
            <div className="flex items-center gap-2 text-slate-700">
              <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-slate-400">In-Charge:</span>
              <strong className="text-slate-900">{branch.inCharge || branch.contactPerson || "Lead Station Engineer"}</strong>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-slate-400">Phone:</span>
              <span>{branch.phone || "+880 1700-000000"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-slate-400">Email:</span>
              <span>{branch.email || "substation@voltflow.com"}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <StatCard
            title="Stored SKUs"
            value={branchProducts.length}
            subtitle="Distinct product lines"
            icon={Boxes}
          />
          <StatCard
            title="Physical Stock"
            value={totalStockInBranch.toLocaleString()}
            subtitle="Units / meters in depot"
            icon={Building2}
          />
          <StatCard
            title="Stock Valuation"
            value={`৳${(totalValuation / 1000).toFixed(0)}k`}
            subtitle="Estimated holding value"
            icon={Layers}
          />
          <StatCard
            title="Station Engineers"
            value={assignedEngineers.length}
            subtitle="Provisioned personnel"
            icon={UsersIcon}
          />
        </div>
      </div>

      {/* Tabs: Branch Inventory vs Branch Transfers vs Assigned Engineers */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="border-b border-slate-200 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`py-4 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === "inventory"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Current On-Hand Inventory ({branchProducts.length})
            </button>
            <button
              onClick={() => setActiveTab("transfers")}
              className={`py-4 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === "transfers"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Transfer History ({branchTransfers.length})
            </button>
            <button
              onClick={() => setActiveTab("engineers")}
              className={`py-4 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeTab === "engineers"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Assigned Engineers ({assignedEngineers.length})
            </button>
          </div>

          {activeTab === "inventory" && (
            <div className="relative w-full sm:w-64 my-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search stored products..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Inventory Table */}
        {activeTab === "inventory" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4 text-right">Available in Branch</th>
                  <th className="py-3 px-4 text-right">Unit Value</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBranchProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      No stock currently on-hand at this branch.
                    </td>
                  </tr>
                ) : (
                  filteredBranchProducts.map((p) => {
                    const status = getProductStatus(p, branch.id);

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4">
                          <Link to={`/products/${p.id}`} className="font-bold text-slate-900 hover:text-blue-600">
                            {p.name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-600">{p.sku}</td>
                        <td className="py-3 px-4 text-slate-600">{p.category || p.categoryName}</td>
                        <td className="py-3 px-4 text-slate-700 font-semibold">{p.brand}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {p.branchQty.toLocaleString()} {p.unit}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600 font-mono">
                          ৳{p.unitPrice?.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={status === "In Stock" ? "success" : "warning"} size="sm">
                            {status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Link
                            to={`/stock-transfer?product=${p.id}&source=${branch.id}`}
                            className="text-xs font-semibold text-blue-600 hover:underline"
                          >
                            Transfer
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Transfers Table */}
        {activeTab === "transfers" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Challan No</th>
                  <th className="py-3 px-4">Direction</th>
                  <th className="py-3 px-4">Partner Branch</th>
                  <th className="py-3 px-4">Items Count</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branchTransfers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No transfer challans recorded for this branch yet.
                    </td>
                  </tr>
                ) : (
                  branchTransfers.map((t) => {
                    const isIncoming = t.toLocationId === branch.id;

                    return (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">{t.challanNo}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded ${
                              isIncoming
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {isIncoming ? "Incoming (Receive)" : "Outgoing (Dispatched)"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {isIncoming ? t.fromLocationName : t.toLocationName}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{t.items?.length || 0} items</td>
                        <td className="py-3 px-4">
                          <Badge variant={t.status === "in_transit" ? "warning" : "success"} size="sm">
                            {t.status === "in_transit" ? "In Transit" : "Received"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-400">
                          {new Date(t.date).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Assigned Engineers Table */}
        {activeTab === "engineers" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Engineer Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Account Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignedEngineers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <UsersIcon className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                      <p className="font-semibold text-slate-600">No engineers currently assigned to this substation</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Main Admin can assign engineers from the System Users directory.
                      </p>
                      <Link
                        to="/users"
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Manage Users Directory</span>
                      </Link>
                    </td>
                  </tr>
                ) : (
                  assignedEngineers.map((u) => (
                    <tr key={u.id || u.uid} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                            {(u.fullName || u.name || "E").charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.fullName || u.name}</p>
                            <p className="text-[10px] text-slate-400">{u.department || "Substation Protection"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                      <td className="py-3 px-4 text-slate-600">{u.phone || "+880 1700-000000"}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={u.status === "Active" || u.isActive !== false ? "success" : "danger"} size="sm">
                          {u.status === "Active" || u.isActive !== false ? "Active" : "Disabled"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link
                          to="/users"
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          View in Directory
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
