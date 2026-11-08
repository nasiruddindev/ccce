import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  initialBranches, 
  initialProducts, 
  initialTransfers, 
  initialSiteUsages 
} from "../mockData";
import { initFirebase, db } from "../firebase";
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc 
} from "firebase/firestore";

const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  // Load initial state from localStorage or mockData
  const [branches, setBranches] = useState(() => {
    const saved = localStorage.getItem("voltflow_branches");
    return saved ? JSON.parse(saved) : initialBranches;
  });

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("voltflow_products");
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [transfers, setTransfers] = useState(() => {
    const saved = localStorage.getItem("voltflow_transfers");
    return saved ? JSON.parse(saved) : initialTransfers;
  });

  const [siteUsages, setSiteUsages] = useState(() => {
    const saved = localStorage.getItem("voltflow_usages");
    return saved ? JSON.parse(saved) : initialSiteUsages;
  });

  // Current selected location filter (e.g., 'all', 'loc_main', or site id)
  const [selectedLocation, setSelectedLocation] = useState("all");

  // Current user role emulation (Owner / Main Warehouse / Site Supervisor)
  const [userRole, setUserRole] = useState({
    id: "admin",
    name: "Engr. Rafiqul Islam",
    role: "Central Warehouse Head",
    locationId: "loc_main"
  });

  // Firebase status
  const [firebaseStatus, setFirebaseStatus] = useState({
    isConfigured: false,
    syncing: false,
    error: null
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("voltflow_branches", JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem("voltflow_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("voltflow_transfers", JSON.stringify(transfers));
  }, [transfers]);

  useEffect(() => {
    localStorage.setItem("voltflow_usages", JSON.stringify(siteUsages));
  }, [siteUsages]);

  // Check Firebase connection on mount
  useEffect(() => {
    const { isConfigured, error } = initFirebase();
    setFirebaseStatus({
      isConfigured: !!isConfigured,
      syncing: false,
      error: error || null
    });
  }, []);

  // 1. Create Transfer / Dispatch Challan
  const createTransfer = async (transferData) => {
    // Generate Challan No if not provided
    const newChallanNumber = `CH-${new Date().getFullYear()}-${String(transfers.length + 183).padStart(4, "0")}`;
    const newTransfer = {
      id: `trf_${Date.now()}`,
      challanNo: newChallanNumber,
      date: new Date().toISOString(),
      status: "in_transit",
      ...transferData
    };

    // Deduct stock from the origin location (typically Main Warehouse)
    const updatedProducts = products.map((prod) => {
      const itemToTransfer = transferData.items.find((item) => item.productId === prod.id);
      if (itemToTransfer) {
        const fromLoc = transferData.fromLocationId;
        const currentStock = prod.stock[fromLoc] || 0;
        const newStock = Math.max(0, currentStock - Number(itemToTransfer.quantity));
        return {
          ...prod,
          stock: {
            ...prod.stock,
            [fromLoc]: newStock
          }
        };
      }
      return prod;
    });

    setProducts(updatedProducts);
    setTransfers([newTransfer, ...transfers]);

    // Optional sync to Firebase if configured
    if (db) {
      try {
        await setDoc(doc(db, "transfers", newTransfer.id), newTransfer);
      } catch (err) {
        console.error("Firestore sync error:", err);
      }
    }

    return newTransfer;
  };

  // 2. Branch Supervisor Confirms Receipt of Goods
  const confirmReceiveTransfer = async (transferId, receiverName) => {
    const transfer = transfers.find((t) => t.id === transferId);
    if (!transfer || transfer.status === "received") return;

    const toLoc = transfer.toLocationId;

    // Add items to destination branch stock
    const updatedProducts = products.map((prod) => {
      const transferredItem = transfer.items.find((i) => i.productId === prod.id);
      if (transferredItem) {
        const currentBranchStock = prod.stock[toLoc] || 0;
        return {
          ...prod,
          stock: {
            ...prod.stock,
            [toLoc]: currentBranchStock + Number(transferredItem.quantity)
          }
        };
      }
      return prod;
    });

    const updatedTransfers = transfers.map((t) => {
      if (t.id === transferId) {
        return {
          ...t,
          status: "received",
          receivedBy: receiverName || userRole.name,
          receivedDate: new Date().toISOString()
        };
      }
      return t;
    });

    setProducts(updatedProducts);
    setTransfers(updatedTransfers);

    if (db) {
      try {
        await updateDoc(doc(db, "transfers", transferId), {
          status: "received",
          receivedBy: receiverName || userRole.name,
          receivedDate: new Date().toISOString()
        });
      } catch (err) {
        console.error("Firestore update error:", err);
      }
    }
  };

  // 3. Add New Product to catalog
  const addProduct = (productData) => {
    const newProd = {
      id: `prod_${Date.now()}`,
      sku: productData.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: productData.name,
      category: productData.category || "General Electrical",
      unit: productData.unit || "Pcs",
      minAlertLevel: Number(productData.minAlertLevel) || 10,
      unitPrice: Number(productData.unitPrice) || 0,
      specs: productData.specs || "",
      stock: {
        loc_main: Number(productData.initialStock) || 0,
        ...productData.stock
      }
    };

    setProducts([newProd, ...products]);
  };

  // 4. Direct Stock Adjustment / New Purchase Arrival
  const adjustStock = (productId, locationId, quantityToAdd, reason) => {
    const updatedProducts = products.map((prod) => {
      if (prod.id === productId) {
        const current = prod.stock[locationId] || 0;
        return {
          ...prod,
          stock: {
            ...prod.stock,
            [locationId]: Math.max(0, current + Number(quantityToAdd))
          }
        };
      }
      return prod;
    });
    setProducts(updatedProducts);
  };

  // 5. Record Site Material Consumption
  const recordSiteUsage = (usageData) => {
    const newUsage = {
      id: `usg_${Date.now()}`,
      date: new Date().toISOString(),
      ...usageData
    };

    // Deduct from that site's inventory
    const updatedProducts = products.map((prod) => {
      if (prod.id === usageData.productId) {
        const current = prod.stock[usageData.locationId] || 0;
        return {
          ...prod,
          stock: {
            ...prod.stock,
            [usageData.locationId]: Math.max(0, current - Number(usageData.quantity))
          }
        };
      }
      return prod;
    });

    setProducts(updatedProducts);
    setSiteUsages([newUsage, ...siteUsages]);
  };

  // 6. Add new site / branch
  const addBranch = (branchData) => {
    const newBranch = {
      id: `loc_${Date.now()}`,
      isMain: false,
      type: "site",
      ...branchData
    };
    setBranches([...branches, newBranch]);
  };

  // 7. Reset sample demo data
  const resetToDemoData = () => {
    setBranches(initialBranches);
    setProducts(initialProducts);
    setTransfers(initialTransfers);
    setSiteUsages(initialSiteUsages);
    localStorage.removeItem("voltflow_branches");
    localStorage.removeItem("voltflow_products");
    localStorage.removeItem("voltflow_transfers");
    localStorage.removeItem("voltflow_usages");
  };

  return (
    <InventoryContext.Provider
      value={{
        branches,
        products,
        transfers,
        siteUsages,
        selectedLocation,
        setSelectedLocation,
        userRole,
        setUserRole,
        firebaseStatus,
        setFirebaseStatus,
        createTransfer,
        confirmReceiveTransfer,
        addProduct,
        adjustStock,
        recordSiteUsage,
        addBranch,
        resetToDemoData
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
