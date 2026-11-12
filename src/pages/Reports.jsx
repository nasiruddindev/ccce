import React, { useState } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  Layers,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Boxes,
  Building2,
  CheckCircle2
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useInventory } from "../context/InventoryContext";
import { monthlyStockMovements } from "../mockData";
import StatCard from "../components/common/StatCard";

const COLORS = ["#2563eb", "#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#f97316"];

export default function Reports() {
  const { products, branches, categories, getBranchStats, calculateTotalStock } = useInventory();
  const [exportNotice, setExportNotice] = useState(null);

  // Valuation by Branch
  const branchValuationData = branches.map((b) => {
    let branchValuation = 0;
    products.forEach((p) => {
      const qty = Number(p.stock?.[b.id]) || 0;
      branchValuation += qty * (p.unitPrice || 0);
    });
    return {
      name: b.code,
      fullName: b.name,
      valuation: Math.round(branchValuation / 1000) // in k BDT
    };
  });

  // Category Distribution
  const categoryData = categories.map((c) => {
    const categoryProducts = products.filter((p) => p.category === c.name);
    const count = categoryProducts.reduce((sum, p) => sum + calculateTotalStock(p), 0);
    return {
      name: c.name,
      code: c.code,
      value: count
    };
  });

  const totalCompanyValuation = products.reduce((sum, p) => {
    return sum + calculateTotalStock(p) * (p.unitPrice || 0);
  }, 0);

  const handleExport = (type) => {
    setExportNotice(`Exported official VoltFlow Inventory Report (${type.toUpperCase()}) successfully.`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory & Valuation Reports</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Executive supply chain analytics, capital valuation, and inter-branch turnover data.
          </p>
        </div>

        {/* Export Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleExport("csv")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Stock Capital Valuation"
          value={`৳${(totalCompanyValuation / 1000000).toFixed(2)}M`}
          subtitle="BDT across all branches"
          trend="up"
          trendValue="+8.2% Q4"
          icon={TrendingUp}
        />
        <StatCard
          title="Active Inventory SKUs"
          value={products.length}
          subtitle="Tracked electrical catalog items"
          icon={Boxes}
        />
        <StatCard
          title="Active Supply Depots"
          value={branches.length}
          subtitle="Warehouses & Substation Sites"
          icon={Building2}
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Stock Valuation by Branch */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">Valuation by Location (k BDT)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Total holding asset value per site depot</p>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchValuationData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(val) => [`৳${val.toLocaleString()}k`, "Valuation"]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px"
                  }}
                />
                <Bar dataKey="valuation" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Volume Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">Category Stock Volume Distribution</h3>
            <p className="text-xs text-slate-500 mt-0.5">Physical units/meters distribution by category</p>
          </div>

          <div className="h-72 w-full pt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name, item) => [`${val.toLocaleString()} units`, item.payload.name]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 flex flex-wrap gap-2 justify-center text-[10px]">
            {categoryData.slice(0, 5).map((cat, i) => (
              <span key={cat.code} className="inline-flex items-center gap-1 text-slate-600">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                {cat.code} ({cat.value.toLocaleString()})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
