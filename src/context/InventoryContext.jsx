import React, { createContext, useContext, useState, useEffect } from "react";
import {
  initialBranches,
  initialProducts,
  initialCategories,
  initialTransfers,
  initialMovements,
  initialUsers,
  mockNotifications
} from "../mockData";

const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  // 1. Core State with v2 key to ensure 11 substations are instantly loaded
  const [branches, setBranches] = useState(() => {
    const saved = localStorage.getItem("voltflow_branches_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.some(b => b.id === "loc_gazaria_230")) return parsed;
      } catch (e) {}
    }
    return initialBranches;
  });

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("voltflow_products_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.some(p => p.stock && p.stock.loc_gazaria_230 !== undefined)) return parsed;
      } catch (e) {}
    }
    return initialProducts;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem("voltflow_categories_v2");
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [transfers, setTransfers] = useState(() => {
    const saved = localStorage.getItem("voltflow_transfers_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.some(t => t.fromLocationId === "loc_gazaria_230")) return parsed;
      } catch (e) {}
    }
    return initialTransfers;
  });

  const [movements, setMovements] = useState(() => {
    const saved = localStorage.getItem("voltflow_movements_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.some(m => m.sourceBranch?.includes("Gazaria"))) return parsed;
      } catch (e) {}
    }
    return initialMovements;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem("voltflow_users_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.some(u => u.branchId === "loc_gazaria_230")) return parsed;
      } catch (e) {}
    }
    return initialUsers;
  });

  const [notifications, setNotifications] = useState(mockNotifications);

  // 2. Active Role Switching: 'Main Admin' or 'Branch Engineer'
  const [currentRole, setCurrentRole] = useState(() => {
    const saved = localStorage.getItem("voltflow_role");
    return saved || "Main Admin";
  });

  // Current Active User matching the role
  const currentUser = currentRole === "Main Admin" 
    ? users.find(u => u.role === "Main Admin") || users[0]
    : users.find(u => u.role === "Branch Engineer") || users[1];

  // Selected branch for global branch filter (or 'all')
  const [selectedBranchId, setSelectedBranchId] = useState("all");

  // Global search term
  const [globalSearch, setGlobalSearch] = useState("");

  // Persist state updates to localStorage v2
  useEffect(() => {
    localStorage.setItem("voltflow_branches_v2", JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem("voltflow_products_v2", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("voltflow_categories_v2", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("voltflow_transfers_v2", JSON.stringify(transfers));
  }, [transfers]);

  useEffect(() => {
    localStorage.setItem("voltflow_movements_v2", JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem("voltflow_users_v2", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("voltflow_role", currentRole);
  }, [currentRole]);

  // Helper calculations
  const calculateTotalStock = (product) => {
    if (!product || !product.stock) return 0;
    return Object.values(product.stock).reduce((sum, qty) => sum + (Number(qty) || 0), 0);
  };

  const getProductStockInBranch = (product, branchId) => {
    if (!product || !product.stock) return 0;
    if (branchId === "all") return calculateTotalStock(product);
    return Number(product.stock[branchId]) || 0;
  };

  const getProductStatus = (product, branchId = "all") => {
    const stock = branchId === "all" ? calculateTotalStock(product) : getProductStockInBranch(product, branchId);
    if (stock <= 0) return "Out of Stock";
    if (stock <= product.minAlertLevel) return "Low Stock";
    return "In Stock";
  };

  // Branch statistics
  const getBranchStats = (branchId) => {
    let totalStock = 0;
    let totalProducts = 0;
    products.forEach((p) => {
      const qty = Number(p.stock?.[branchId]) || 0;
      if (qty > 0) {
        totalProducts += 1;
        totalStock += qty;
      }
    });
    return { totalStock, totalProducts };
  };

  // Company totals
  const totalCompanyStock = products.reduce((acc, p) => acc + calculateTotalStock(p), 0);
  const lowStockCount = products.filter(p => calculateTotalStock(p) <= p.minAlertLevel).length;

  // Actions
  const switchRole = (newRole) => {
    setCurrentRole(newRole);
  };

  // Add a transfer (Atomic Deduction from Source Substation)
  const createTransfer = (transferData) => {
    const challanNo = `CH-${new Date().getFullYear()}-${String(transfers.length + 183).padStart(4, "0")}`;
    const newTransfer = {
      id: `trf_${Date.now()}`,
      challanNo,
      date: new Date().toISOString(),
      status: "in_transit",
      ...transferData
    };

    setTransfers(prev => [newTransfer, ...prev]);

    // Atomic stock deduction from source branch
    setProducts(prevProducts =>
      prevProducts.map(p => {
        const item = (transferData.items || []).find(i => (i.productId || i.id) === (p.id || p.productId));
        if (item) {
          const currentQty = Number(p.stock?.[transferData.fromLocationId]) || 0;
          return {
            ...p,
            stock: {
              ...p.stock,
              [transferData.fromLocationId]: Math.max(0, currentQty - Number(item.quantity))
            }
          };
        }
        return p;
      })
    );

    // Add corresponding immutable movement records
    const newMovements = (transferData.items || []).map(item => ({
      id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toISOString(),
      type: "Transfer Out",
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      sourceBranch: transferData.fromLocationName,
      destinationBranch: transferData.toLocationName,
      quantity: -Number(item.quantity),
      unit: item.unit,
      referenceNo: challanNo,
      performedBy: transferData.dispatchedBy || currentUser?.name || "Station Lead",
      status: "In Transit"
    }));

    setMovements(prev => [...newMovements, ...prev]);
    return newTransfer;
  };

  // Mark transfer as received (Atomic Credit to Destination Substation)
  const markTransferReceived = (transferId) => {
    const targetTransfer = transfers.find(t => t.id === transferId);
    if (!targetTransfer || targetTransfer.status === "received") return;

    // Credit inventory to destination branch
    setProducts(prevProducts =>
      prevProducts.map(p => {
        const item = (targetTransfer.items || []).find(i => (i.productId || i.id) === (p.id || p.productId));
        if (item) {
          const currentQty = Number(p.stock?.[targetTransfer.toLocationId]) || 0;
          return {
            ...p,
            stock: {
              ...p.stock,
              [targetTransfer.toLocationId]: currentQty + Number(item.quantity)
            }
          };
        }
        return p;
      })
    );

    // Add 'Transfer In' movement record
    const inMovements = (targetTransfer.items || []).map(item => ({
      id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toISOString(),
      type: "Transfer In",
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      sourceBranch: targetTransfer.fromLocationName,
      destinationBranch: targetTransfer.toLocationName,
      quantity: Number(item.quantity),
      unit: item.unit,
      referenceNo: targetTransfer.challanNo,
      performedBy: currentUser?.name || "Station Lead",
      status: "Completed"
    }));
    setMovements(prev => [...inMovements, ...prev]);

    setTransfers(prev =>
      prev.map(t =>
        t.id === transferId
          ? { ...t, status: "received", receivedDate: new Date().toISOString(), receivedBy: currentUser?.name || "Station Lead" }
          : t
      )
    );
  };

  // Record Material Usage ("In Use This Branch" / কাজে ব্যবহার)
  const recordMaterialUsage = ({ productId, branchId, quantity, taskDescription, user }) => {
    const numQty = Number(quantity);
    if (!numQty || numQty <= 0) {
      throw new Error("Invalid quantity: Must be greater than 0.");
    }

    const prod = products.find(p => (p.id || p.productId) === productId);
    if (!prod) {
      throw new Error("Product not found.");
    }

    const currentBranchStock = Number(prod.stock?.[branchId]) || 0;
    if (currentBranchStock < numQty) {
      throw new Error(`Insufficient stock! Available in this branch: ${currentBranchStock} ${prod.unit}.`);
    }

    const branch = branches.find(b => (b.id || b.branchId) === branchId);
    const branchName = branch?.name || branchId;

    // Atomic Stock Deduction
    setProducts(prevProducts =>
      prevProducts.map(p => {
        if ((p.id || p.productId) === productId) {
          const prevStock = Number(p.stock?.[branchId]) || 0;
          return {
            ...p,
            stock: {
              ...p.stock,
              [branchId]: Math.max(0, prevStock - numQty)
            }
          };
        }
        return p;
      })
    );

    const refNo = `USE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const reasonText = taskDescription?.trim() || "In Use This Branch - Substation maintenance & installation";
    const performer = user?.fullName || user?.name || currentUser?.fullName || currentUser?.name || "Station Engineer";

    const newMovement = {
      id: `mov_use_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toISOString(),
      type: "In Use (This Branch)",
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      sourceBranch: branchName,
      destinationBranch: "Internal Substation Task (In Use This Branch)",
      quantity: -numQty,
      unit: prod.unit,
      referenceNo: refNo,
      reason: reasonText,
      performedBy: performer,
      status: "In Use (This Branch)"
    };

    setMovements(prev => [newMovement, ...prev]);
    return { success: true, referenceNo: refNo, movement: newMovement };
  };

  // Add Product
  const addProduct = (newProduct) => {
    const prodWithId = {
      ...newProduct,
      id: `prod_${Date.now()}`,
      stock: newProduct.stock || { loc_gazaria_230: 100 }
    };
    setProducts(prev => [prodWithId, ...prev]);
  };

  // Add Branch
  const addBranch = (newBranch) => {
    const branchWithId = {
      ...newBranch,
      id: `loc_${Date.now()}`,
      status: "Active"
    };
    setBranches(prev => [...prev, branchWithId]);
  };

  // Add User
  const addUser = (newUser) => {
    const userWithId = {
      ...newUser,
      id: `usr_${Date.now()}`,
      status: "Active",
      joinedDate: new Date().toISOString().split("T")[0]
    };
    setUsers(prev => [...prev, userWithId]);
  };

  // Reset to initial demo data
  const resetToDemo = () => {
    localStorage.removeItem("voltflow_branches");
    localStorage.removeItem("voltflow_products");
    localStorage.removeItem("voltflow_categories");
    localStorage.removeItem("voltflow_transfers");
    localStorage.removeItem("voltflow_movements");
    localStorage.removeItem("voltflow_users");
    localStorage.removeItem("voltflow_branches_v2");
    localStorage.removeItem("voltflow_products_v2");
    localStorage.removeItem("voltflow_categories_v2");
    localStorage.removeItem("voltflow_transfers_v2");
    localStorage.removeItem("voltflow_movements_v2");
    localStorage.removeItem("voltflow_users_v2");
    setBranches(initialBranches);
    setProducts(initialProducts);
    setCategories(initialCategories);
    setTransfers(initialTransfers);
    setMovements(initialMovements);
    setUsers(initialUsers);
  };

  return (
    <InventoryContext.Provider
      value={{
        branches,
        products,
        categories,
        transfers,
        movements,
        users,
        notifications,
        setNotifications,
        currentRole,
        switchRole,
        currentUser,
        selectedBranchId,
        setSelectedBranchId,
        globalSearch,
        setGlobalSearch,
        calculateTotalStock,
        getProductStockInBranch,
        getProductStatus,
        getBranchStats,
        totalCompanyStock,
        lowStockCount,
        createTransfer,
        markTransferReceived,
        recordMaterialUsage,
        addProduct,
        addBranch,
        addUser,
        resetToDemo
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
