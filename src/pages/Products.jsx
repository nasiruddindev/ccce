import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  ArrowRightLeft,
  MoreVertical,
  Layers,
  Sparkles,
  Download,
  AlertTriangle,
  Edit2,
  Archive,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  ShieldAlert
} from "lucide-react";
import { useInventory } from "../context/InventoryContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { productService } from "../services/productService";
import Badge from "../components/common/Badge";
import Modal from "../components/common/Modal";

export default function Products() {
  const {
    products,
    categories,
    calculateTotalStock,
    getProductStatus,
    addProduct,
    updateProduct: updateInventoryProduct
  } = useInventory();

  const { userProfile, isAdmin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [archiveFilter, setArchiveFilter] = useState("Active"); // 'Active', 'Archived', 'all'
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form states
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    category: "Cables & Wires",
    brand: "BRB Cable",
    modelNumber: "",
    unit: "Meters",
    minAlertLevel: 100,
    unitPrice: 150,
    specs: "",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150&auto=format&fit=crop&q=80"
  });

  const [editProduct, setEditProduct] = useState({
    id: "",
    name: "",
    sku: "",
    category: "",
    brand: "",
    modelNumber: "",
    unit: "",
    minAlertLevel: 100,
    unitPrice: 100,
    specs: ""
  });

  // Extract unique brands
  const brands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));

  // Filter products
  const filteredProducts = products.filter((prod) => {
    const totalStock = calculateTotalStock(prod);
    const stockStatus = getProductStatus(prod);
    const itemStatus = prod.status || "Active";

    const matchesSearch =
      (prod.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.sku || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.brand || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.modelNumber || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "all" || prod.category === selectedCategory || prod.categoryName === selectedCategory;
    const matchesBrand = selectedBrand === "all" || prod.brand === selectedBrand;
    const matchesStockStatus = statusFilter === "all" || stockStatus === statusFilter;
    const matchesArchiveStatus = archiveFilter === "all" || itemStatus === archiveFilter;

    return matchesSearch && matchesCategory && matchesBrand && matchesStockStatus && matchesArchiveStatus;
  });

  // Handle Add Product Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      addToast("Unauthorized: Only an authorized Main Admin can create products.", "error");
      return;
    }

    if (!newProduct.name || !newProduct.sku) {
      addToast("Product name and SKU are mandatory.", "error");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Verify unique SKU with backend service
      const cleanSku = newProduct.sku.trim().toUpperCase();
      const isUnique = await productService.isSkuUnique(cleanSku);
      if (!isUnique) {
        addToast(`Duplicate SKU Error: A product with SKU '${cleanSku}' already exists.`, "error");
        setIsLoading(false);
        return;
      }

      // 2. Create in backend service
      const created = await productService.createProduct(userProfile, {
        productName: newProduct.name,
        sku: cleanSku,
        categoryId: categories.find((c) => c.name === newProduct.category)?.id || "cat_1",
        categoryName: newProduct.category,
        brand: newProduct.brand,
        modelNumber: newProduct.modelNumber || cleanSku,
        imageUrl: newProduct.image,
        unit: newProduct.unit,
        description: newProduct.specs,
        minimumStockLevel: Number(newProduct.minAlertLevel),
        unitPrice: Number(newProduct.unitPrice),
        stock: { loc_gazaria_230: 100 }
      });

      // 3. Update in local inventory state
      addProduct({
        id: created.productId || created.id,
        name: created.productName,
        sku: created.sku,
        category: created.categoryName,
        brand: created.brand,
        modelNumber: created.modelNumber,
        unit: created.unit,
        minAlertLevel: created.minimumStockLevel,
        unitPrice: created.unitPrice,
        specs: created.description,
        image: created.imageUrl,
        status: "Active",
        stock: created.stock
      });

      addToast(`Product '${created.productName}' created successfully with SKU ${cleanSku}.`, "success");
      setIsAddModalOpen(false);
      setNewProduct({
        name: "",
        sku: "",
        category: "Cables & Wires",
        brand: "BRB Cable",
        modelNumber: "",
        unit: "Meters",
        minAlertLevel: 100,
        unitPrice: 150,
        specs: "",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150&auto=format&fit=crop&q=80"
      });
    } catch (err) {
      addToast(err.message || "Failed to create product.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (prod) => {
    setSelectedProduct(prod);
    setEditProduct({
      id: prod.id,
      name: prod.name,
      sku: prod.sku,
      category: prod.category || "Cables & Wires",
      brand: prod.brand || "",
      modelNumber: prod.modelNumber || prod.sku,
      unit: prod.unit || "Pcs",
      minAlertLevel: prod.minAlertLevel || 100,
      unitPrice: prod.unitPrice || 100,
      specs: prod.specs || ""
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      addToast("Unauthorized: Only an authorized Main Admin can edit products.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const cleanSku = editProduct.sku.trim().toUpperCase();
      const isUnique = await productService.isSkuUnique(cleanSku, editProduct.id);
      if (!isUnique) {
        addToast(`Duplicate SKU Error: Another product is already using SKU '${cleanSku}'.`, "error");
        setIsLoading(false);
        return;
      }

      await productService.updateProduct(userProfile, editProduct.id, {
        productName: editProduct.name,
        sku: cleanSku,
        categoryName: editProduct.category,
        brand: editProduct.brand,
        modelNumber: editProduct.modelNumber,
        unit: editProduct.unit,
        minimumStockLevel: Number(editProduct.minAlertLevel),
        unitPrice: Number(editProduct.unitPrice),
        description: editProduct.specs
      });

      // Update in context
      if (updateInventoryProduct) {
        updateInventoryProduct(editProduct.id, {
          name: editProduct.name,
          sku: cleanSku,
          category: editProduct.category,
          brand: editProduct.brand,
          modelNumber: editProduct.modelNumber,
          unit: editProduct.unit,
          minAlertLevel: Number(editProduct.minAlertLevel),
          unitPrice: Number(editProduct.unitPrice),
          specs: editProduct.specs
        });
      } else {
        const target = products.find((p) => p.id === editProduct.id);
        if (target) {
          target.name = editProduct.name;
          target.sku = cleanSku;
          target.category = editProduct.category;
          target.brand = editProduct.brand;
          target.modelNumber = editProduct.modelNumber;
          target.unit = editProduct.unit;
          target.minAlertLevel = Number(editProduct.minAlertLevel);
          target.unitPrice = Number(editProduct.unitPrice);
          target.specs = editProduct.specs;
        }
      }

      addToast(`Product '${editProduct.name}' updated successfully!`, "success");
      setIsEditModalOpen(false);
    } catch (err) {
      addToast(err.message || "Failed to update product.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Open Archive Confirmation Modal
  const handleOpenArchive = (prod) => {
    setSelectedProduct(prod);
    setIsArchiveModalOpen(true);
  };

  // Confirm Archive (Soft delete, preserving inventory)
  const handleConfirmArchive = async () => {
    if (!selectedProduct) return;
    if (!isAdmin) {
      addToast("Unauthorized: Only an authorized Main Admin can archive products.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await productService.archiveProduct(userProfile, selectedProduct.id);
      selectedProduct.status = "Archived";
      addToast(res.message || "Product archived. Historical inventory preserved.", "info");
      setIsArchiveModalOpen(false);
    } catch (err) {
      addToast(err.message || "Failed to archive product.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Restore Product
  const handleRestoreProduct = async (prod) => {
    if (!isAdmin) {
      addToast("Unauthorized: Only an authorized Main Admin can restore products.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await productService.restoreProduct(userProfile, prod.id);
      prod.status = "Active";
      addToast(res.message || "Product restored to active catalog.", "success");
    } catch (err) {
      addToast(err.message || "Failed to restore product.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Electrical Products Catalog</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse and manage all electrical SKUs, technical specs, and multi-location balances.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              <span>Read-Only Engineer Mode</span>
            </span>
          )}
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, SKU, brand..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Dropdown */}
          <div>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Brands ({brands.length})</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Level Dropdown */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Stock Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          {/* Catalog State (Active / Archived) */}
          <div>
            <select
              value={archiveFilter}
              onChange={(e) => setArchiveFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Active">Catalog: Active Only</option>
              <option value="Archived">Catalog: Archived</option>
              <option value="all">Catalog: All Records</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Product Image</th>
                <th className="py-3.5 px-4">Product Name & Model</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Brand</th>
                <th className="py-3.5 px-4 text-right">Total Stock</th>
                <th className="py-3.5 px-4 text-center">Stock Status</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <Package className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-400" />
                    <p className="font-semibold text-slate-700 text-sm">No products found</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      No inventory records match the current filter criteria or search keyword.
                    </p>
                    {(searchTerm || selectedCategory !== "all" || selectedBrand !== "all" || archiveFilter !== "Active") && (
                      <button
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedCategory("all");
                          setSelectedBrand("all");
                          setStatusFilter("all");
                          setArchiveFilter("Active");
                        }}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Filters</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const totalStock = calculateTotalStock(prod);
                  const stockStatus = getProductStatus(prod);
                  const isArchived = prod.status === "Archived";

                  return (
                    <tr
                      key={prod.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isArchived ? "bg-slate-50/40 opacity-75" : ""
                      }`}
                    >
                      {/* Product Image */}
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                          <img
                            src={prod.image || prod.imageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150"}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150";
                            }}
                          />
                        </div>
                      </td>

                      {/* Product Name & Specs */}
                      <td className="py-3 px-4 max-w-xs">
                        <Link
                          to={`/products/${prod.id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 transition truncate block"
                          title={prod.name}
                        >
                          {prod.name}
                        </Link>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5" title={prod.specs || prod.description}>
                          {prod.modelNumber ? `Model: ${prod.modelNumber} • ` : ""}
                          {prod.specs || prod.description || "Industrial Grade Component"}
                        </p>
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {prod.sku}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="text-slate-700 font-medium">{prod.category || prod.categoryName}</span>
                      </td>

                      {/* Brand */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          {prod.brand}
                        </span>
                      </td>

                      {/* Total Stock Across All Branches */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-slate-900 text-sm">
                          {totalStock.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {prod.unit}
                        </div>
                      </td>

                      {/* Stock Status */}
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            stockStatus === "In Stock"
                              ? "success"
                              : stockStatus === "Low Stock"
                              ? "warning"
                              : "danger"
                          }
                          size="sm"
                        >
                          {stockStatus}
                        </Badge>
                      </td>

                      {/* Status (Active / Archived) */}
                      <td className="py-3 px-4 text-center">
                        {isArchived ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Archived
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Product Details */}
                          <Link
                            to={`/products/${prod.id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="View Product Details & Cross-Branch Stock"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* Transfer Stock Shortcut */}
                          <Link
                            to={`/stock-transfer?product=${prod.id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                            title="Transfer Stock"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </Link>

                          {/* Admin-Only Edit Action */}
                          {isAdmin && (
                            <button
                              onClick={() => handleOpenEdit(prod)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                              title="Edit Product Details"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Admin-Only Archive or Restore Action */}
                          {isAdmin && (
                            isArchived ? (
                              <button
                                onClick={() => handleRestoreProduct(prod)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                                title="Restore to Active Catalog"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenArchive(prod)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Archive Product (Preserve Stock)"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            )
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

        {/* Table Footer */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Showing <strong className="text-slate-800">{filteredProducts.length}</strong> of {products.length} products
          </span>
          <div className="text-slate-400 text-[11px]">
            VoltFlow Multi-Branch Grid Inventory System
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Electrical Product"
        subtitle="Fill in specifications and technical details for the new inventory item."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Full Name *
              </label>
              <input
                type="text"
                required
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="e.g. BYA 4.0 rm Fire Resistant Cable"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SKU Code (Must be Unique) *
              </label>
              <input
                type="text"
                required
                value={newProduct.sku}
                onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value.toUpperCase() })}
                placeholder="e.g. CBL-BYA-4.0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Manufacturer / Brand
              </label>
              <input
                type="text"
                value={newProduct.brand}
                onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                placeholder="e.g. BRB Cable / ABB / Schneider"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Model Number
              </label>
              <input
                type="text"
                value={newProduct.modelNumber}
                onChange={(e) => setNewProduct({ ...newProduct, modelNumber: e.target.value })}
                placeholder="e.g. MOD-2024-X"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit of Measurement
              </label>
              <input
                type="text"
                value={newProduct.unit}
                onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                placeholder="Meters, Pcs, Bundles, Sets"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit Price (BDT ৳)
              </label>
              <input
                type="number"
                value={newProduct.unitPrice}
                onChange={(e) => setNewProduct({ ...newProduct, unitPrice: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Minimum Stock Alert Threshold
              </label>
              <input
                type="number"
                value={newProduct.minAlertLevel}
                onChange={(e) => setNewProduct({ ...newProduct, minAlertLevel: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Technical Specifications & Standard
            </label>
            <textarea
              rows={3}
              value={newProduct.specs}
              onChange={(e) => setNewProduct({ ...newProduct, specs: e.target.value })}
              placeholder="e.g. BDS 901 standard, 450/750V, annealed copper conductor..."
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
              {isLoading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Product Details"
        subtitle="Modify technical specifications, unit price, and safety alert levels."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={editProduct.name}
                onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SKU Code *
              </label>
              <input
                type="text"
                required
                value={editProduct.sku}
                onChange={(e) => setEditProduct({ ...editProduct, sku: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={editProduct.category}
                onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brand
              </label>
              <input
                type="text"
                value={editProduct.brand}
                onChange={(e) => setEditProduct({ ...editProduct, brand: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Model Number
              </label>
              <input
                type="text"
                value={editProduct.modelNumber}
                onChange={(e) => setEditProduct({ ...editProduct, modelNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit of Measurement
              </label>
              <input
                type="text"
                value={editProduct.unit}
                onChange={(e) => setEditProduct({ ...editProduct, unit: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit Price (BDT ৳)
              </label>
              <input
                type="number"
                value={editProduct.unitPrice}
                onChange={(e) => setEditProduct({ ...editProduct, unitPrice: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Min Stock Threshold
              </label>
              <input
                type="number"
                value={editProduct.minAlertLevel}
                onChange={(e) => setEditProduct({ ...editProduct, minAlertLevel: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Technical Specifications
            </label>
            <textarea
              rows={3}
              value={editProduct.specs}
              onChange={(e) => setEditProduct({ ...editProduct, specs: e.target.value })}
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

      {/* Archive Confirmation Modal */}
      <Modal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        title="Archive Electrical Product"
        subtitle="Safe archival preserves inventory audit trails and movement history."
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Historical Data Preservation Rule</p>
              <p className="mt-1 leading-relaxed text-amber-800">
                To prevent breaking historical challans, dispatches, and warehouse audit logs, this product will be <strong>archived</strong> rather than permanently deleted. Existing quantities across branches remain intact and tracked.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <p className="text-slate-500">Target Item:</p>
            <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedProduct?.name}</p>
            <p className="text-slate-400 font-mono text-[11px] mt-0.5">SKU: {selectedProduct?.sku}</p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsArchiveModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmArchive}
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Archiving..." : "Confirm Archive"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
