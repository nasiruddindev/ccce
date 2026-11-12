import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  ArrowRightLeft,
  Building2,
  Barcode,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  TrendingDown,
  TrendingUp,
  Tag
} from "lucide-react";
import { useInventory } from "../context/InventoryContext";
import Badge from "../components/common/Badge";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    products,
    branches,
    calculateTotalStock,
    getProductStatus,
    getProductStockInBranch,
    movements
  } = useInventory();

  const product = products.find((p) => p.id === id) || products[0];

  if (!product) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <Package className="w-12 h-12 mx-auto text-slate-400 mb-3" />
        <h3 className="text-base font-bold text-slate-800">Product Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">The requested product could not be found.</p>
        <Link
          to="/products"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
      </div>
    );
  }

  const totalStock = calculateTotalStock(product);
  const status = getProductStatus(product);
  const totalValuation = totalStock * (product.unitPrice || 0);

  // Filter movements for this product
  const productMovements = movements.filter(
    (m) => m.productId === product.id || m.productName.includes(product.name.substring(0, 10))
  );

  return (
    <div className="space-y-6">
      {/* Top Navigation Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/products")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>

        <Link
          to={`/stock-transfer?product=${product.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-xs"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Dispatch / Transfer This Item</span>
        </Link>
      </div>

      {/* Main Product Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Product Image & Badges */}
          <div className="space-y-4">
            <div className="aspect-square w-full rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400";
                }}
              />
              <div className="absolute top-3 left-3">
                <Badge
                  variant={status === "In Stock" ? "success" : status === "Low Stock" ? "warning" : "danger"}
                >
                  {status}
                </Badge>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Barcode className="w-4 h-4 text-slate-400" />
                <span className="font-mono text-slate-500">Barcode:</span>
              </div>
              <span className="font-mono font-bold text-slate-800">{product.barcode || "N/A"}</span>
            </div>
          </div>

          {/* Product Details & Specifications (2 cols) */}
          <div className="md:col-span-2 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {product.sku}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {product.category}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                  {product.brand}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {product.name}
              </h2>

              <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                <strong className="text-slate-800">Technical Specifications: </strong>
                {product.specs || "Standard industrial compliant electrical specifications."}
              </p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Stock</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">
                  {totalStock.toLocaleString()} <span className="text-xs text-slate-500 font-normal">{product.unit}</span>
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Unit Price</span>
                <p className="text-lg font-bold text-blue-600 mt-0.5">
                  ৳{product.unitPrice?.toLocaleString()}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Stock Valuation</span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">
                  ৳{totalValuation.toLocaleString()}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Alert Level</span>
                <p className="text-lg font-bold text-amber-600 mt-0.5">
                  {product.minAlertLevel} <span className="text-xs text-slate-500 font-normal">{product.unit}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Branch Stock Breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Multi-Branch Distribution</h3>
            <p className="text-xs text-slate-500 mt-0.5">Current inventory levels allocated across each site warehouse</p>
          </div>
          <span className="text-xs font-semibold text-slate-600">
            {branches.length} Active Branches
          </span>
        </div>

        <div className="divide-y divide-slate-100 mt-4">
          {branches.map((b) => {
            const qty = getProductStockInBranch(product, b.id);
            const percentage = totalStock > 0 ? Math.round((qty / totalStock) * 100) : 0;

            return (
              <div key={b.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{b.name}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                      {b.code}
                    </span>
                    {b.isMain && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded">
                        Main Warehouse
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{b.location}</p>

                  {/* Stock progress bar */}
                  <div className="w-full sm:max-w-md bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        b.isMain ? "bg-blue-600" : "bg-indigo-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900">
                      {qty.toLocaleString()} {product.unit}
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium">{percentage}% of company stock</p>
                  </div>

                  <Link
                    to={`/stock-transfer?product=${product.id}&source=${b.id}&dest=${b.isMain ? (branches.find(x => !x.isMain)?.id || "") : (branches.find(x => x.isMain)?.id || "")}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                    title="Transfer from/to this substation"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Movement History for this product */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Movement & Dispatch History</h3>
          </div>
          <Link to="/stock-movements" className="text-xs text-blue-600 font-semibold hover:underline">
            View Full Audit Trail &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="pb-3">Reference No</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Source &rarr; Destination</th>
                <th className="pb-3 text-right">Quantity</th>
                <th className="pb-3">Handled By</th>
                <th className="pb-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productMovements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No recent movement records for this item.
                  </td>
                </tr>
              ) : (
                productMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-3 font-mono font-bold text-blue-600">{m.referenceNo}</td>
                    <td className="py-3">
                      <span className="font-semibold text-slate-700">{m.type}</span>
                    </td>
                    <td className="py-3 text-slate-600">
                      {m.sourceBranch} &rarr; {m.destinationBranch}
                    </td>
                    <td className="py-3 text-right font-bold font-mono">
                      <span className={m.quantity < 0 ? "text-rose-600" : "text-emerald-600"}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity} {m.unit}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{m.performedBy}</td>
                    <td className="py-3 text-right text-slate-400 font-mono">
                      {new Date(m.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
