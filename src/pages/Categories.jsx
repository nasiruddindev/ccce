import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Layers,
  Plus,
  Package,
  Zap,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Sun,
  Server,
  Lightbulb,
  Edit2,
  Archive,
  RotateCcw,
  Search,
  AlertTriangle,
  ShieldAlert
} from "lucide-react";
import { useInventory } from "../context/InventoryContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { categoryService } from "../services/categoryService";
import Modal from "../components/common/Modal";

export default function Categories() {
  const { categories, products, calculateTotalStock, addCategory } = useInventory();
  const { userProfile, isAdmin } = useAuth();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [newCat, setNewCat] = useState({ name: "", code: "", description: "" });
  const [editCat, setEditCat] = useState({ id: "", name: "", code: "", description: "" });

  // Map category icons
  const getCategoryIcon = (code) => {
    switch (code) {
      case "CBL":
        return Zap;
      case "SWG":
        return ShieldCheck;
      case "PNL":
        return Cpu;
      case "LGT":
        return Lightbulb;
      case "SOL":
        return Sun;
      case "TRF":
        return Server;
      default:
        return Layers;
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle Add Category
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      addToast("Unauthorized: Only Main Admin can create categories.", "error");
      return;
    }

    if (!newCat.name || !newCat.code) {
      addToast("Category name and code are mandatory.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const created = await categoryService.createCategory(userProfile, newCat);
      if (addCategory) {
        addCategory({
          id: created.categoryId || created.id,
          name: created.name,
          code: created.code,
          description: created.description,
          itemCount: 0
        });
      } else {
        categories.push({
          id: created.categoryId || created.id,
          name: created.name,
          code: created.code,
          description: created.description,
          itemCount: 0
        });
      }

      addToast(`Category '${created.name}' created successfully.`, "success");
      setIsAddModalOpen(false);
      setNewCat({ name: "", code: "", description: "" });
    } catch (err) {
      addToast(err.message || "Failed to create category.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (cat) => {
    setSelectedCat(cat);
    setEditCat({
      id: cat.id || cat.categoryId,
      name: cat.name,
      code: cat.code,
      description: cat.description || ""
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      addToast("Unauthorized: Only Main Admin can edit categories.", "error");
      return;
    }

    setIsLoading(true);
    try {
      await categoryService.updateCategory(userProfile, editCat.id, {
        name: editCat.name,
        code: editCat.code.toUpperCase(),
        description: editCat.description
      });

      const target = categories.find((c) => (c.id || c.categoryId) === editCat.id);
      if (target) {
        target.name = editCat.name;
        target.code = editCat.code.toUpperCase();
        target.description = editCat.description;
      }

      addToast(`Category '${editCat.name}' updated successfully!`, "success");
      setIsEditModalOpen(false);
    } catch (err) {
      addToast(err.message || "Failed to update category.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Open Archive Modal
  const handleOpenArchive = (cat) => {
    setSelectedCat(cat);
    setIsArchiveModalOpen(true);
  };

  // Confirm Archive (Protected against categories containing active products)
  const handleConfirmArchive = async () => {
    if (!selectedCat) return;
    if (!isAdmin) {
      addToast("Unauthorized: Only Main Admin can archive categories.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await categoryService.archiveCategory(
        userProfile,
        selectedCat.id || selectedCat.categoryId,
        selectedCat.name
      );
      selectedCat.status = "Archived";
      addToast(res.message, "info");
      setIsArchiveModalOpen(false);
    } catch (err) {
      addToast(err.message || "Failed to archive category.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Categories</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hierarchical categorization of electrical supplies, distribution boards, and heavy gear.
          </p>
        </div>
        {isAdmin ? (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-medium">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
            <span>Read-Only View</span>
          </span>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search category name, code, or description..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="text-xs text-slate-500 hidden sm:block">
          Total Categories: <strong className="text-slate-800">{categories.length}</strong>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Layers className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700 text-sm">No categories match your search</p>
            <p className="text-xs text-slate-400 mt-1">Try searching with a different term.</p>
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const IconComponent = getCategoryIcon(cat.code);
            const categoryProducts = products.filter(
              (p) => (p.category === cat.name || p.categoryName === cat.name) && p.status !== "Archived"
            );
            const totalStockInCat = categoryProducts.reduce(
              (sum, p) => sum + calculateTotalStock(p),
              0
            );
            const totalValuation = categoryProducts.reduce(
              (sum, p) => sum + calculateTotalStock(p) * (p.unitPrice || 0),
              0
            );
            const isArchived = cat.status === "Archived";

            return (
              <div
                key={cat.id || cat.categoryId}
                className={`bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between group ${
                  isArchived ? "opacity-60 bg-slate-50/50" : ""
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {cat.code}
                      </span>
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {!isArchived && (
                            <button
                              onClick={() => handleOpenArchive(cat)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                              title="Archive Category"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 mt-4 group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                    {cat.description || "Official electrical hardware grouping for grid substations."}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Active SKUs:</span>
                    <span className="font-bold text-slate-800">
                      {categoryProducts.length > 0 ? categoryProducts.length : (cat.itemCount || 0)} items
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Stock:</span>
                    <span className="font-bold text-slate-800">
                      {totalStockInCat.toLocaleString()} units
                    </span>
                  </div>
                  {totalValuation > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Estimated Value:</span>
                      <span className="font-bold text-blue-600">
                        ৳{totalValuation.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <Link
                    to={`/products`}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold transition"
                  >
                    <span>Explore Items</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Category"
        subtitle="Group new types of electrical equipment and accessories."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={newCat.name}
              onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
              placeholder="e.g. Busbar Trunking Systems"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category Code *
            </label>
            <input
              type="text"
              required
              value={newCat.code}
              onChange={(e) => setNewCat({ ...newCat, code: e.target.value.toUpperCase() })}
              placeholder="e.g. BBT"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={newCat.description}
              onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
              placeholder="Brief details about items belonging to this category..."
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
              {isLoading ? "Saving..." : "Save Category"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Category"
        subtitle="Modify category title, abbreviation code, or description."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={editCat.name}
              onChange={(e) => setEditCat({ ...editCat, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category Code *
            </label>
            <input
              type="text"
              required
              value={editCat.code}
              onChange={(e) => setEditCat({ ...editCat, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={editCat.description}
              onChange={(e) => setEditCat({ ...editCat, description: e.target.value })}
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

      {/* Archive Category Modal (Safeguarded against categories with active products) */}
      <Modal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        title="Archive Category"
        subtitle="Safeguard against breaking catalog dependencies."
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Active Products Safeguard Rule</p>
              <p className="mt-1 leading-relaxed text-amber-800">
                You cannot archive or delete a category that still contains active electrical products. If products exist in this category, the system will prevent the operation.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <p className="text-slate-500">Category to Archive:</p>
            <p className="font-bold text-slate-800 text-sm mt-0.5">{selectedCat?.name}</p>
            <p className="text-slate-400 font-mono text-[11px] mt-0.5">Code: {selectedCat?.code}</p>
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
              {isLoading ? "Verifying & Archiving..." : "Confirm Archive"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
