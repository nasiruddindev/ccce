import React from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Building2,
  Boxes,
  AlertTriangle,
  ArrowRightLeft,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { useInventory } from "../context/InventoryContext";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/common/StatCard";
import Badge from "../components/common/Badge";
import { monthlyStockMovements } from "../mockData";

export default function Dashboard() {
  const { userRole } = useAuth();
  const {
    products,
    branches,
    transfers,
    totalCompanyStock,
    lowStockCount,
    calculateTotalStock,
    getProductStatus,
    getBranchStats
  } = useInventory();

  // Branch-wise summary data for chart
  const branchChartData = branches.map((b) => {
    const stats = getBranchStats(b.id);
    return {
      name: b.code,
      fullName: b.name,
      stock: stats.totalStock,
      products: stats.totalProducts
    };
  });

  // Recent 4 transfers
  const recentTransfers = transfers.slice(0, 4);

  // Critical low stock items (top 4)
  const criticalLowStock = products
    .filter((p) => calculateTotalStock(p) <= p.minAlertLevel)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-blue-950/20">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-3">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>VoltFlow Enterprise Cloud &bull; {userRole} View</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Electrical Multi-Branch Inventory
          </h1>
          <p className="mt-2 text-sm text-blue-100/80 leading-relaxed">
            Real-time multi-location tracking for cables, switchgear, distribution panels, and substation equipment across all warehouses and project sites.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/stock-transfer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-sm"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Create Stock Transfer</span>
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur-xs transition"
            >
              <Package className="w-4 h-4" />
              <span>Browse Electrical Catalog</span>
            </Link>
          </div>
        </div>

        {/* Subtle Decorative Background Element */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center pointer-events-none">
          <Boxes className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Products"
          value={products.length}
          subtitle="Active SKUs in Catalog"
          trend="up"
          trendValue="+4 new"
          icon={Package}
          iconBg="bg-blue-50 text-blue-600 border-blue-100"
        />
        <StatCard
          title="Total Branches"
          value={branches.length}
          subtitle="1 Central + 4 Site Depots"
          icon={Building2}
          iconBg="bg-indigo-50 text-indigo-600 border-indigo-100"
        />
        <StatCard
          title="Total Company Stock"
          value={totalCompanyStock.toLocaleString()}
          subtitle="Cumulative Units / Meters"
          trend="up"
          trendValue="+12.4% vs last mo."
          icon={Boxes}
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
        />
        <StatCard
          title="Low Stock Products"
          value={lowStockCount}
          subtitle="Below safety threshold"
          trend={lowStockCount > 0 ? "down" : "neutral"}
          trendValue={lowStockCount > 0 ? "Action required" : "Healthy"}
          icon={AlertTriangle}
          iconBg={lowStockCount > 0 ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-slate-50 text-slate-600 border-slate-100"}
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Stock Movement Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Monthly Stock Movement</h3>
              <p className="text-xs text-slate-500 mt-0.5">Procurement Inflow vs Project Outflow (2026)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                Inflow (Stock In)
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                Outflow (Dispatches)
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyStockMovements} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px"
                  }}
                />
                <Area type="monotone" dataKey="inflow" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInflow)" />
                <Area type="monotone" dataKey="outflow" stroke="#818cf8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOutflow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch-wise Stock Summary (1 Col) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Branch-wise Stock</h3>
                <p className="text-xs text-slate-500 mt-0.5">Quantity distributed by location</p>
              </div>
              <Link to="/branches" className="text-xs text-blue-600 font-semibold hover:underline">
                View All
              </Link>
            </div>

            <div className="h-56 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px"
                    }}
                  />
                  <Bar dataKey="stock" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Central Warehouse holds ~65%</span>
            <Link to="/branch-inventory" className="text-blue-600 font-semibold hover:underline">
              Inspect Inventory &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Lower Dashboard: Recent Transfers & Low Stock Alert Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transfers (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Recent Stock Transfers</h3>
              <p className="text-xs text-slate-500 mt-0.5">Inter-branch dispatches and challans</p>
            </div>
            <Link to="/transfer-history" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              <span>View History</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="pb-3 font-semibold">Challan No</th>
                  <th className="pb-3 font-semibold">Source &rarr; Destination</th>
                  <th className="pb-3 font-semibold">Items</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransfers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 font-mono font-bold text-blue-600">
                      <Link to="/transfer-history" className="hover:underline">
                        {t.challanNo}
                      </Link>
                    </td>
                    <td className="py-3">
                      <div className="text-slate-800 font-medium truncate max-w-[200px]">
                        {t.fromLocationName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        &rarr; {t.toLocationName}
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">
                      {t.items?.length || 0} item(s)
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={t.status === "in_transit" ? "warning" : "success"}
                        size="sm"
                      >
                        {t.status === "in_transit" ? "In Transit" : "Received"}
                      </Badge>
                    </td>
                    <td className="py-3 text-right text-slate-500 font-mono text-[11px]">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts (1 Col) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-base">Low Stock Alerts</h3>
              </div>
              <Link to="/low-stock" className="text-xs font-semibold text-blue-600 hover:underline">
                View All ({lowStockCount})
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {criticalLowStock.map((prod) => {
                const total = calculateTotalStock(prod);
                return (
                  <div
                    key={prod.id}
                    className="p-3 rounded-xl border border-amber-100 bg-amber-50/40 hover:bg-amber-50 transition flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{prod.name}</p>
                      <p className="text-[10px] font-mono text-slate-500">{prod.sku} &bull; {prod.brand}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-amber-700">
                        {total} {prod.unit}
                      </span>
                      <p className="text-[9px] text-slate-400">Min: {prod.minAlertLevel}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              to="/stock-transfer"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Initiate Rebalance Transfer</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
