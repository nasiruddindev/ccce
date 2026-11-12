import React, { useState, useMemo } from "react";
import {
  FileText,
  FileSpreadsheet,
  Download,
  Filter,
  Calendar,
  Building2,
  Package,
  Layers,
  Search,
  ArrowRightLeft,
  Activity,
  SlidersHorizontal,
  AlertTriangle,
  XCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Boxes
} from "lucide-react";
import { useInventory } from "../context/InventoryContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { exportToCSV } from "../utils/csvExport";
import Badge from "../components/common/Badge";
import StatCard from "../components/common/StatCard";

// 8 Defined Report Types
const REPORT_TYPES = [
  { id: "overall_stock", name: "1. Overall Stock Report", icon: Package, description: "Catalog-wide inventory valuation, quantities, and unit values" },
  { id: "branch_inventory", name: "2. Branch-wise Inventory Report", icon: Building2, description: "Distribution depot and substation physical holding summary" },
  { id: "product_stock", name: "3. Product-wise Stock Report", icon: Boxes, description: "Multi-branch quantity breakdown per individual SKU" },
  { id: "low_stock", name: "4. Low Stock Report", icon: AlertTriangle, description: "Items below minimum safety threshold across branches" },
  { id: "out_of_stock", name: "5. Out-of-Stock Report", icon: XCircle, description: "Critical SKUs with zero stock balance in depots" },
  { id: "stock_transfer", name: "6. Stock Transfer Report", icon: ArrowRightLeft, description: "Official challans, inter-station transit statuses, and routes" },
  { id: "stock_movement", name: "7. Stock Movement Report", icon: Activity, description: "Audit trail of physical stock receipts, dispatches, and usage" },
  { id: "stock_adjustment", name: "8. Stock Adjustment Report", icon: SlidersHorizontal, description: "Physical counts, surplus reconciliations, and damage write-offs" }
];

export default function Reports() {
  const { products, branches, categories, transfers, movements, calculateTotalStock, getProductStockInBranch } = useInventory();
  const { userProfile, userRole, isAdmin, isEngineer } = useAuth();
  const { addToast } = useToast();

  // Active Report
  const [selectedReportId, setSelectedReportId] = useState("overall_stock");

  // Filters State
  const [dateRange, setDateRange] = useState("all"); // 'all', 'today', '7days', '30days', 'this_month'
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedMovementType, setSelectedMovementType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Engineer assigned substation lock (if engineer wants to filter)
  const engineerStationId = userProfile?.branchId;

  // ---------------------------------------------------------------------------
  // FILTER HELPERS
  // ---------------------------------------------------------------------------
  const isDateInRange = (dateString) => {
    if (!dateString || dateRange === "all") return true;
    const itemDate = new Date(dateString);
    const now = new Date();

    if (dateRange === "today") {
      return itemDate.toDateString() === now.toDateString();
    }
    if (dateRange === "7days") {
      const past7 = new Date();
      past7.setDate(past7.getDate() - 7);
      return itemDate >= past7;
    }
    if (dateRange === "30days") {
      const past30 = new Date();
      past30.setDate(past30.getDate() - 30);
      return itemDate >= past30;
    }
    if (dateRange === "this_month") {
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    }
    return true;
  };

  // Reset all filters
  const handleResetFilters = () => {
    setDateRange("all");
    setSelectedBranch("all");
    setSelectedCategory("all");
    setSelectedProduct("all");
    setSelectedMovementType("all");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // ---------------------------------------------------------------------------
  // REPORT 1: OVERALL STOCK REPORT
  // ---------------------------------------------------------------------------
  const overallStockData = useMemo(() => {
    return products
      .filter((p) => p.status !== "Archived")
      .map((p) => {
        const totalQty = selectedBranch === "all" ? calculateTotalStock(p) : getProductStockInBranch(p, selectedBranch);
        const valuation = totalQty * (p.unitPrice || 0);
        return {
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: p.category || p.categoryName || "Cables",
          brand: p.brand,
          unit: p.unit,
          unitPrice: p.unitPrice || 0,
          totalQty,
          minAlertLevel: p.minAlertLevel || 100,
          valuation,
          status: totalQty === 0 ? "Out of Stock" : totalQty <= p.minAlertLevel ? "Low Stock" : "In Stock"
        };
      })
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.brand?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
        const matchesProduct = selectedProduct === "all" || p.id === selectedProduct;
        return matchesSearch && matchesCategory && matchesProduct;
      });
  }, [products, selectedBranch, selectedCategory, selectedProduct, searchTerm]);

  // ---------------------------------------------------------------------------
  // REPORT 2: BRANCH-WISE INVENTORY REPORT
  // ---------------------------------------------------------------------------
  const branchInventoryData = useMemo(() => {
    return branches
      .filter((b) => selectedBranch === "all" || b.id === selectedBranch)
      .map((b) => {
        let totalItems = 0;
        let totalVolume = 0;
        let totalValuation = 0;

        products.forEach((p) => {
          const qty = Number(p.stock?.[b.id]) || 0;
          if (qty > 0) {
            totalItems += 1;
            totalVolume += qty;
            totalValuation += qty * (p.unitPrice || 0);
          }
        });

        return {
          id: b.id,
          code: b.code,
          name: b.name,
          address: b.address || b.location,
          contactPerson: b.inCharge || b.contactPerson || "Lead Station Engineer",
          phone: b.phone || "+880 1700-000000",
          totalProducts: totalItems,
          totalVolume,
          totalValuation,
          status: b.status || "Active",
          isMain: b.isMain || false
        };
      })
      .filter((b) => {
        return (
          b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
  }, [branches, products, selectedBranch, searchTerm]);

  // ---------------------------------------------------------------------------
  // REPORT 3: PRODUCT-WISE STOCK REPORT (Multi-Substation Breakdown)
  // ---------------------------------------------------------------------------
  const productWiseStockData = useMemo(() => {
    return products
      .filter((p) => p.status !== "Archived")
      .map((p) => {
        const total = calculateTotalStock(p);
        const branchBreakdown = {};
        branches.forEach((b) => {
          branchBreakdown[b.id] = Number(p.stock?.[b.id]) || 0;
        });

        return {
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: p.category || p.categoryName,
          unit: p.unit,
          totalStock: total,
          branches: branchBreakdown
        };
      })
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
        const matchesProduct = selectedProduct === "all" || p.id === selectedProduct;
        return matchesSearch && matchesCategory && matchesProduct;
      });
  }, [products, branches, selectedCategory, selectedProduct, searchTerm]);

  // ---------------------------------------------------------------------------
  // REPORT 4: LOW STOCK REPORT
  // ---------------------------------------------------------------------------
  const lowStockData = useMemo(() => {
    return overallStockData.filter((p) => p.status === "Low Stock");
  }, [overallStockData]);

  // ---------------------------------------------------------------------------
  // REPORT 5: OUT-OF-STOCK REPORT
  // ---------------------------------------------------------------------------
  const outOfStockData = useMemo(() => {
    return overallStockData.filter((p) => p.status === "Out of Stock");
  }, [overallStockData]);

  // ---------------------------------------------------------------------------
  // REPORT 6: STOCK TRANSFER REPORT
  // ---------------------------------------------------------------------------
  const stockTransferData = useMemo(() => {
    return transfers
      .filter((t) => {
        const matchesDate = isDateInRange(t.date);
        const matchesBranch =
          selectedBranch === "all" ||
          t.fromLocationId === selectedBranch ||
          t.toLocationId === selectedBranch;
        const matchesSearch =
          (t.challanNo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (t.fromLocationName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (t.toLocationName || "").toLowerCase().includes(searchTerm.toLowerCase());
        return matchesDate && matchesBranch && matchesSearch;
      })
      .map((t) => ({
        id: t.id,
        challanNo: t.challanNo,
        date: new Date(t.date).toLocaleDateString(),
        from: t.fromLocationName,
        to: t.toLocationName,
        itemsCount: (t.items || []).length,
        itemsSummary: (t.items || []).map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join("; "),
        vehicleNo: t.vehicleNo || "N/A",
        dispatchedBy: t.dispatchedBy || "Station Lead",
        status: t.status === "in_transit" ? "In Transit" : "Received"
      }));
  }, [transfers, dateRange, selectedBranch, searchTerm]);

  // ---------------------------------------------------------------------------
  // REPORT 7: STOCK MOVEMENT REPORT
  // ---------------------------------------------------------------------------
  const stockMovementData = useMemo(() => {
    return movements
      .filter((m) => {
        const matchesDate = isDateInRange(m.date);
        const matchesBranch =
          selectedBranch === "all" ||
          m.sourceBranch?.includes(selectedBranch) ||
          m.destinationBranch?.includes(selectedBranch);
        const matchesType = selectedMovementType === "all" || m.type === selectedMovementType;
        const matchesProduct = selectedProduct === "all" || m.productId === selectedProduct;
        const matchesSearch =
          (m.productName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (m.sku || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (m.referenceNo || "").toLowerCase().includes(searchTerm.toLowerCase());
        return matchesDate && matchesBranch && matchesType && matchesProduct && matchesSearch;
      })
      .map((m) => ({
        id: m.id,
        date: new Date(m.date).toLocaleDateString(),
        type: m.type,
        productName: m.productName,
        sku: m.sku,
        quantity: m.quantity,
        unit: m.unit,
        source: m.sourceBranch,
        destination: m.destinationBranch,
        referenceNo: m.referenceNo,
        performedBy: m.performedBy,
        status: m.status || "Completed"
      }));
  }, [movements, dateRange, selectedBranch, selectedMovementType, selectedProduct, searchTerm]);

  // ---------------------------------------------------------------------------
  // REPORT 8: STOCK ADJUSTMENT REPORT
  // ---------------------------------------------------------------------------
  const stockAdjustmentData = useMemo(() => {
    return movements
      .filter((m) => m.type === "Stock Adjustment")
      .filter((m) => {
        const matchesDate = isDateInRange(m.date);
        const matchesBranch =
          selectedBranch === "all" ||
          m.sourceBranch?.includes(selectedBranch) ||
          m.destinationBranch?.includes(selectedBranch);
        const matchesSearch =
          (m.productName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (m.reason || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (m.referenceNo || "").toLowerCase().includes(searchTerm.toLowerCase());
        return matchesDate && matchesBranch && matchesSearch;
      })
      .map((m) => ({
        id: m.id,
        date: new Date(m.date).toLocaleDateString(),
        referenceNo: m.referenceNo,
        productName: m.productName,
        sku: m.sku,
        quantity: m.quantity,
        unit: m.unit,
        branch: m.sourceBranch,
        reason: m.reason || "Reconciliation discrepancy adjustment",
        performedBy: m.performedBy,
        status: m.status || "Reconciled"
      }));
  }, [movements, dateRange, selectedBranch, searchTerm]);

  // ---------------------------------------------------------------------------
  // CURRENT ACTIVE DATASET & PAGINATION
  // ---------------------------------------------------------------------------
  const currentDataset = useMemo(() => {
    switch (selectedReportId) {
      case "overall_stock":
        return overallStockData;
      case "branch_inventory":
        return branchInventoryData;
      case "product_stock":
        return productWiseStockData;
      case "low_stock":
        return lowStockData;
      case "out_of_stock":
        return outOfStockData;
      case "stock_transfer":
        return stockTransferData;
      case "stock_movement":
        return stockMovementData;
      case "stock_adjustment":
        return stockAdjustmentData;
      default:
        return overallStockData;
    }
  }, [
    selectedReportId,
    overallStockData,
    branchInventoryData,
    productWiseStockData,
    lowStockData,
    outOfStockData,
    stockTransferData,
    stockMovementData,
    stockAdjustmentData
  ]);

  const totalPages = Math.max(1, Math.ceil(currentDataset.length / rowsPerPage));
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return currentDataset.slice(startIndex, startIndex + rowsPerPage);
  }, [currentDataset, currentPage, rowsPerPage]);

  // ---------------------------------------------------------------------------
  // CSV EXPORT HANDLERS (Specific formats & role aware)
  // ---------------------------------------------------------------------------
  const handleExportCSV = (reportType = selectedReportId) => {
    let filename = `VoltFlow_${reportType}`;
    let headers = [];
    let rows = [];

    switch (reportType) {
      case "overall_stock":
        filename = "VoltFlow_Overall_Stock_Report";
        headers = [
          { label: "SKU", key: "sku" },
          { label: "Product Name", key: "name" },
          { label: "Category", key: "category" },
          { label: "Brand", key: "brand" },
          { label: "Stock Qty", key: "totalQty" },
          { label: "Unit", key: "unit" },
          { label: "Unit Price (BDT)", key: "unitPrice" },
          { label: "Valuation (BDT)", key: "valuation" },
          { label: "Status", key: "status" }
        ];
        rows = overallStockData;
        break;

      case "branch_inventory":
        filename = "VoltFlow_Branch_Inventory_Report";
        headers = [
          { label: "Branch Code", key: "code" },
          { label: "Branch Name", key: "name" },
          { label: "Location", key: "address" },
          { label: "In-Charge", key: "contactPerson" },
          { label: "Phone", key: "phone" },
          { label: "Total SKUs", key: "totalProducts" },
          { label: "Total Volume", key: "totalVolume" },
          { label: "Valuation (BDT)", key: "totalValuation" },
          { label: "Status", key: "status" }
        ];
        rows = branchInventoryData;
        break;

      case "product_stock":
        filename = "VoltFlow_Product_Stock_Report";
        headers = [
          { label: "SKU", key: "sku" },
          { label: "Product Name", key: "name" },
          { label: "Category", key: "category" },
          { label: "Total Stock", key: "totalStock" },
          { label: "Unit", key: "unit" }
        ];
        rows = productWiseStockData;
        break;

      case "low_stock":
        filename = "VoltFlow_Low_Stock_Report";
        headers = [
          { label: "SKU", key: "sku" },
          { label: "Product Name", key: "name" },
          { label: "Category", key: "category" },
          { label: "Current Stock", key: "totalQty" },
          { label: "Safety Alert Level", key: "minAlertLevel" },
          { label: "Unit", key: "unit" },
          { label: "Status", key: "status" }
        ];
        rows = lowStockData;
        break;

      case "out_of_stock":
        filename = "VoltFlow_Out_Of_Stock_Report";
        headers = [
          { label: "SKU", key: "sku" },
          { label: "Product Name", key: "name" },
          { label: "Category", key: "category" },
          { label: "Stock Level", key: "totalQty" },
          { label: "Unit", key: "unit" }
        ];
        rows = outOfStockData;
        break;

      case "stock_transfer":
        filename = "VoltFlow_Stock_Transfer_Report";
        headers = [
          { label: "Challan No", key: "challanNo" },
          { label: "Date", key: "date" },
          { label: "Origin Branch", key: "from" },
          { label: "Destination Branch", key: "to" },
          { label: "Items Count", key: "itemsCount" },
          { label: "Items Summary", key: "itemsSummary" },
          { label: "Vehicle No", key: "vehicleNo" },
          { label: "Status", key: "status" }
        ];
        rows = stockTransferData;
        break;

      case "stock_movement":
        filename = "VoltFlow_Stock_Movement_Report";
        headers = [
          { label: "Date", key: "date" },
          { label: "Type", key: "type" },
          { label: "Product Name", key: "productName" },
          { label: "SKU", key: "sku" },
          { label: "Quantity", key: "quantity" },
          { label: "Unit", key: "unit" },
          { label: "Source", key: "source" },
          { label: "Destination", key: "destination" },
          { label: "Ref No", key: "referenceNo" },
          { label: "Performed By", key: "performedBy" }
        ];
        rows = stockMovementData;
        break;

      case "stock_adjustment":
        filename = "VoltFlow_Stock_Adjustment_Report";
        headers = [
          { label: "Date", key: "date" },
          { label: "Ref No", key: "referenceNo" },
          { label: "Product Name", key: "productName" },
          { label: "SKU", key: "sku" },
          { label: "Adjustment Qty", key: "quantity" },
          { label: "Unit", key: "unit" },
          { label: "Branch", key: "branch" },
          { label: "Audit Reason", key: "reason" },
          { label: "Performed By", key: "performedBy" }
        ];
        rows = stockAdjustmentData;
        break;

      default:
        rows = [];
    }

    const success = exportToCSV(filename, headers, rows);
    if (success) {
      addToast(`Generated and downloaded ${filename}.csv (${rows.length} records)`, "success");
    }
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------------- */}
      {/* 1. REPORT HEADER & BREADCRUMBS */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Inventory Reports</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official operational reports, valuation audits, and CSV export center.
          </p>
        </div>

        {/* Global CSV Download Trigger */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleExportCSV(selectedReportId)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Active Report (CSV)</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 2. 8 REPORT TYPE SELECTOR PILLS */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {REPORT_TYPES.map((rep) => {
            const Icon = rep.icon;
            const isSelected = selectedReportId === rep.id;
            return (
              <button
                key={rep.id}
                onClick={() => {
                  setSelectedReportId(rep.id);
                  setCurrentPage(1);
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl text-center transition cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                }`}
                title={rep.description}
              >
                <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? "text-white" : "text-blue-600"}`} />
                <span className="text-[11px] font-bold line-clamp-1 leading-tight">{rep.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 3. MULTI-DIMENSIONAL FILTERS TOOLBAR */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Advanced Filters</span>
          </div>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-blue-600 transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Query */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search keyword..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Date Range Filter */}
          <div>
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Date: All Records</option>
              <option value="today">Date: Today</option>
              <option value="7days">Date: Last 7 Days</option>
              <option value="30days">Date: Last 30 Days</option>
              <option value="this_month">Date: This Month</option>
            </select>
          </div>

          {/* Branch Substation Filter */}
          <div>
            <select
              value={selectedBranch}
              onChange={(e) => {
                setSelectedBranch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Branch: All 11 Substations</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code} - {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Category: All ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Filter */}
          <div>
            <select
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Product: All SKUs ({products.length})</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku}
                </option>
              ))}
            </select>
          </div>

          {/* Movement Type Filter */}
          <div>
            <select
              value={selectedMovementType}
              onChange={(e) => {
                setSelectedMovementType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Movement: All Types</option>
              <option value="Procurement Inflow">Procurement Inflow</option>
              <option value="Transfer Out">Transfer Out</option>
              <option value="Transfer In">Transfer In</option>
              <option value="In Use (This Branch)">In Use (This Branch)</option>
              <option value="Site Consumption">Site Consumption</option>
              <option value="Stock Adjustment">Stock Adjustment</option>
            </select>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 4. ACTIVE REPORT DATA TABLE */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900 text-base">
              {REPORT_TYPES.find((r) => r.id === selectedReportId)?.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {REPORT_TYPES.find((r) => r.id === selectedReportId)?.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              Total Records: <strong className="text-slate-800">{currentDataset.length}</strong>
            </span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>

        {/* Dynamic Table Body according to Report ID */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            {/* REPORT 1: OVERALL STOCK REPORT */}
            {selectedReportId === "overall_stock" && (
              <>
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Brand</th>
                    <th className="py-3 px-4 text-right">Stock Qty</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Total Valuation</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.length === 0 ? (
                    <tr><td colSpan={8} className="py-12 text-center text-slate-400">No matching records.</td></tr>
                  ) : (
                    paginatedData.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">{row.sku}</td>
                        <td className="py-3 px-4 font-medium text-slate-900">{row.name}</td>
                        <td className="py-3 px-4 text-slate-600">{row.category}</td>
                        <td className="py-3 px-4 text-slate-700">{row.brand}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">{row.totalQty.toLocaleString()} {row.unit}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-600">৳{row.unitPrice.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-blue-600">৳{row.valuation.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={row.status === "In Stock" ? "success" : row.status === "Low Stock" ? "warning" : "danger"} size="sm">
                            {row.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </>
            )}

            {/* REPORT 2: BRANCH INVENTORY REPORT */}
            {selectedReportId === "branch_inventory" && (
              <>
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Branch Code</th>
                    <th className="py-3 px-4">Substation Name</th>
                    <th className="py-3 px-4">Physical Location</th>
                    <th className="py-3 px-4">In-Charge Lead</th>
                    <th className="py-3 px-4 text-right">Stored SKUs</th>
                    <th className="py-3 px-4 text-right">Total Units</th>
                    <th className="py-3 px-4 text-right">Total Valuation</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.length === 0 ? (
                    <tr><td colSpan={8} className="py-12 text-center text-slate-400">No matching branches.</td></tr>
                  ) : (
                    paginatedData.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">{row.code}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{row.name}</td>
                        <td className="py-3 px-4 text-slate-600">{row.address}</td>
                        <td className="py-3 px-4 text-slate-700">{row.contactPerson}</td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-800">{row.totalProducts}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">{row.totalVolume.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-blue-600">৳{row.totalValuation.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={row.status === "Active" ? "success" : "neutral"} size="sm">{row.status}</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </>
            )}

            {/* REPORT 3: PRODUCT-WISE STOCK REPORT */}
            {selectedReportId === "product_stock" && (
              <>
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">SKU Code</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Total Stock</th>
                    <th className="py-3 px-4">Gazaria 230</th>
                    <th className="py-3 px-4">Kobirpur 230</th>
                    <th className="py-3 px-4">Kaliakoir 230</th>
                    <th className="py-3 px-4">Mirpur 132</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.length === 0 ? (
                    <tr><td colSpan={8} className="py-12 text-center text-slate-400">No matching products.</td></tr>
                  ) : (
                    paginatedData.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">{row.sku}</td>
                        <td className="py-3 px-4 font-medium text-slate-900">{row.name}</td>
                        <td className="py-3 px-4 text-slate-600">{row.category}</td>
                        <td className="py-3 px-4 text-right font-bold text-blue-600">{row.totalStock.toLocaleString()} {row.unit}</td>
                        <td className="py-3 px-4 text-slate-700">{row.branches?.loc_gazaria_230?.toLocaleString() || 0}</td>
                        <td className="py-3 px-4 text-slate-700">{row.branches?.loc_kobirpur_230?.toLocaleString() || 0}</td>
                        <td className="py-3 px-4 text-slate-700">{row.branches?.loc_kaliakoir_230?.toLocaleString() || 0}</td>
                        <td className="py-3 px-4 text-slate-700">{row.branches?.loc_mirpur_132?.toLocaleString() || 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </>
            )}

            {/* REPORT 4 & 5: LOW STOCK & OUT OF STOCK */}
            {(selectedReportId === "low_stock" || selectedReportId === "out_of_stock") && (
              <>
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Current Available Stock</th>
                    <th className="py-3 px-4 text-right">Safety Minimum Threshold</th>
                    <th className="py-3 px-4 text-right">Deficit to Safety Level</th>
                    <th className="py-3 px-4 text-center">Urgency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-slate-400">All inventory levels are currently healthy!</td></tr>
                  ) : (
                    paginatedData.map((row) => {
                      const deficit = Math.max(0, row.minAlertLevel - row.totalQty);
                      return (
                        <tr key={row.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-mono font-bold text-slate-700">{row.sku}</td>
                          <td className="py-3 px-4 font-medium text-slate-900">{row.name}</td>
                          <td className="py-3 px-4 text-slate-600">{row.category}</td>
                          <td className="py-3 px-4 text-right font-extrabold text-rose-600">{row.totalQty.toLocaleString()} {row.unit}</td>
                          <td className="py-3 px-4 text-right text-slate-500">{row.minAlertLevel.toLocaleString()} {row.unit}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-amber-600">-{deficit.toLocaleString()}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={row.totalQty === 0 ? "danger" : "warning"} size="sm">
                              {row.totalQty === 0 ? "Zero Stockout" : "Low Stock Alert"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </>
            )}

            {/* REPORT 6: STOCK TRANSFER REPORT */}
            {selectedReportId === "stock_transfer" && (
              <>
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Challan No</th>
                    <th className="py-3 px-4">Dispatch Date</th>
                    <th className="py-3 px-4">Source Substation</th>
                    <th className="py-3 px-4">Destination Substation</th>
                    <th className="py-3 px-4">Items Summary</th>
                    <th className="py-3 px-4">Transport Vehicle</th>
                    <th className="py-3 px-4 text-center">Challan Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-slate-400">No transfer records found.</td></tr>
                  ) : (
                    paginatedData.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600">{row.challanNo}</td>
                        <td className="py-3 px-4 text-slate-500">{row.date}</td>
                        <td className="py-3 px-4 font-medium text-slate-800">{row.from}</td>
                        <td className="py-3 px-4 font-medium text-slate-800">{row.to}</td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={row.itemsSummary}>{row.itemsSummary}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{row.vehicleNo}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant={row.status === "In Transit" ? "warning" : "success"} size="sm">{row.status}</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </>
            )}

            {/* REPORT 7: STOCK MOVEMENT AUDIT REPORT */}
            {selectedReportId === "stock_movement" && (
              <>
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Movement Type</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4 text-right">Quantity</th>
                    <th className="py-3 px-4">Source &rarr; Dest</th>
                    <th className="py-3 px-4">Challan / PO Ref</th>
                    <th className="py-3 px-4">Authorized By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.length === 0 ? (
                    <tr><td colSpan={8} className="py-12 text-center text-slate-400">No movements recorded.</td></tr>
                  ) : (
                    paginatedData.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono text-slate-500">{row.date}</td>
                        <td className="py-3 px-4">
                          <span className="font-semibold px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">{row.type}</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">{row.productName}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{row.sku}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          <span className={row.quantity >= 0 ? "text-emerald-600" : "text-rose-600"}>
                            {row.quantity >= 0 ? `+${row.quantity}` : row.quantity} {row.unit}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{row.source} &rarr; {row.destination}</td>
                        <td className="py-3 px-4 font-mono text-blue-600">{row.referenceNo}</td>
                        <td className="py-3 px-4 text-slate-700">{row.performedBy}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </>
            )}

            {/* REPORT 8: STOCK ADJUSTMENT REPORT */}
            {selectedReportId === "stock_adjustment" && (
              <>
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Audit Ref No</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4 text-right">Adjustment Qty</th>
                    <th className="py-3 px-4">Substation Depot</th>
                    <th className="py-3 px-4">Reconciliation Reason</th>
                    <th className="py-3 px-4">Audited By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.length === 0 ? (
                    <tr><td colSpan={8} className="py-12 text-center text-slate-400">No stock adjustments recorded.</td></tr>
                  ) : (
                    paginatedData.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono text-slate-500">{row.date}</td>
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600">{row.referenceNo}</td>
                        <td className="py-3 px-4 font-medium text-slate-900">{row.productName}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{row.sku}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          <span className={row.quantity >= 0 ? "text-emerald-600" : "text-rose-600"}>
                            {row.quantity >= 0 ? `+${row.quantity}` : row.quantity} {row.unit}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{row.branch}</td>
                        <td className="py-3 px-4 text-slate-600">{row.reason}</td>
                        <td className="py-3 px-4 text-slate-700">{row.performedBy}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </>
            )}
          </table>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* PAGINATION TOOLBAR */}
        {/* ----------------------------------------------------------------- */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{Math.min(currentDataset.length, (currentPage - 1) * rowsPerPage + 1)}</strong> to{" "}
            <strong className="text-slate-800">{Math.min(currentDataset.length, currentPage * rowsPerPage)}</strong> of{" "}
            <strong className="text-slate-800">{currentDataset.length}</strong> records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-bold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
