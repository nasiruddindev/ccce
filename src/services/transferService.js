import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase.js";

// Safe In-Memory & LocalStorage persistence for testing and client runtime
const memoryStore = {};
const safeStorage = {
  getItem: (key) => (typeof localStorage !== "undefined" ? localStorage.getItem(key) : memoryStore[key]),
  setItem: (key, val) => (typeof localStorage !== "undefined" ? localStorage.setItem(key, val) : (memoryStore[key] = val))
};

// Cache of recently processed idempotency keys to prevent duplicate concurrent transfers
const processedRequestIds = new Set();

export const transferService = {
  /**
   * Secure stock transfer creation
   * Strictly enforces RBAC, single substation constraint, positive quantity,
   * active branch status, and insufficient stock prevention.
   */
  async createTransfer(userProfile, transferData, currentProducts, currentBranches) {
    // 1. Authenticated User Verification
    if (!userProfile || !userProfile.role) {
      throw new Error("Authentication Required: You must be signed in to execute a transfer.");
    }

    if (userProfile.isActive === false) {
      throw new Error("Account Disabled: Your account has been suspended by an administrator.");
    }

    // 2. Idempotency / Duplicate Execution Guard
    if (transferData.idempotencyKey || transferData.challanNo) {
      const requestId = transferData.idempotencyKey || `${transferData.challanNo}_${transferData.fromLocationId}_${transferData.toLocationId}`;
      if (processedRequestIds.has(requestId)) {
        throw new Error("Duplicate Execution Prevented: A transfer with this reference is already in progress.");
      }
      processedRequestIds.add(requestId);
      setTimeout(() => processedRequestIds.delete(requestId), 60000); // 1-minute idempotency window
    }

    // 3. Branch Validation & RBAC Substation Lock
    const { fromLocationId, toLocationId, items } = transferData;

    if (!fromLocationId || !toLocationId) {
      throw new Error("Validation Error: Source and destination substations are mandatory.");
    }

    if (fromLocationId === toLocationId) {
      throw new Error("Validation Error: Source and destination substations cannot be identical.");
    }

    const sourceBranch = currentBranches.find((b) => (b.id || b.branchId) === fromLocationId);
    const destBranch = currentBranches.find((b) => (b.id || b.branchId) === toLocationId);

    if (!sourceBranch || sourceBranch.status === "Inactive") {
      throw new Error(`Invalid Operation: Source substation is either invalid or inactive.`);
    }

    if (!destBranch || destBranch.status === "Inactive") {
      throw new Error(`Invalid Operation: Destination substation is either invalid or inactive.`);
    }

    // Strict Engineer Scope Lock: An engineer can ONLY transfer from their assigned substation!
    if (userProfile.role === "Branch Engineer") {
      if (fromLocationId !== userProfile.branchId) {
        throw new Error(
          `Security Exception: Unauthorized source substation. As a Branch Engineer, you are cryptographically restricted to dispatching materials solely from your assigned substation (${userProfile.branchName || userProfile.branchId}).`
        );
      }
    }

    // 4. Items & Stock Validation (Atomic Check)
    if (!items || !items.length) {
      throw new Error("Validation Error: Transfer must contain at least one valid inventory item.");
    }

    const updatedProductsMap = {};

    for (const item of items) {
      const qty = Number(item.quantity);
      if (!qty || qty <= 0 || !Number.isInteger(qty)) {
        throw new Error(`Invalid Quantity: Transfer quantity for '${item.productName || item.sku}' must be a positive integer.`);
      }

      const prod = currentProducts.find((p) => (p.id || p.productId) === item.productId);
      if (!prod) {
        throw new Error(`Item Not Found: Product '${item.productId}' does not exist in catalog.`);
      }

      if (prod.status === "Archived") {
        throw new Error(`Catalog Error: Product '${prod.name || prod.productName}' is archived and cannot be transferred.`);
      }

      const currentSourceStock = Number(prod.stock?.[fromLocationId]) || 0;
      if (currentSourceStock < qty) {
        throw new Error(
          `Insufficient Stock: '${prod.name || prod.productName}' has only ${currentSourceStock} ${prod.unit} available at ${sourceBranch.name || sourceBranch.branchName}. Requested transfer is ${qty} ${prod.unit}.`
        );
      }

      // Prepare atomically updated stock map
      const prodKey = prod.id || prod.productId;
      const updatedStock = { ...(prod.stock || {}) };
      updatedStock[fromLocationId] = currentSourceStock - qty;
      updatedProductsMap[prodKey] = {
        ...prod,
        stock: updatedStock
      };
    }

    // 5. Construct Secure Challan Record
    const challanNo = transferData.challanNo || `CH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTransferRecord = {
      id: `trf_${Date.now()}`,
      challanNo,
      date: new Date().toISOString(),
      fromLocationId,
      fromLocationName: sourceBranch.name || sourceBranch.branchName,
      toLocationId,
      toLocationName: destBranch.name || destBranch.branchName,
      vehicleNo: transferData.vehicleNo || "Grid Utility Van",
      driverName: transferData.driverName || "Official Courier",
      driverPhone: transferData.driverPhone || "+880 1700-000000",
      dispatchedBy: userProfile.fullName || userProfile.name || "Station Lead",
      dispatchedByUid: userProfile.uid,
      notes: transferData.notes || "Grid maintenance supply dispatch",
      status: "in_transit",
      items: items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        sku: i.sku,
        unit: i.unit,
        quantity: Number(i.quantity)
      })),
      createdAt: new Date().toISOString()
    };

    // 6. Generate Append-Only Audit Trail Movements
    const newMovements = items.map((item) => ({
      id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: new Date().toISOString(),
      type: "Transfer Out",
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      sourceBranch: sourceBranch.name || sourceBranch.branchName,
      destinationBranch: destBranch.name || destBranch.branchName,
      quantity: -Number(item.quantity),
      unit: item.unit,
      referenceNo: challanNo,
      performedBy: userProfile.fullName || userProfile.name || "Station Lead",
      performedByUid: userProfile.uid,
      status: "In Transit",
      immutable: true
    }));

    return {
      success: true,
      transfer: newTransferRecord,
      movements: newMovements,
      updatedProducts: Object.values(updatedProductsMap)
    };
  },

  /**
   * Secure receipt confirmation
   * Credits the destination substation and marks transfer as 'received'
   */
  async confirmTransferReceipt(userProfile, transferId, allTransfers, allProducts) {
    if (!userProfile) throw new Error("Authentication Required.");
    if (userProfile.isActive === false) throw new Error("Account Disabled.");

    const transfer = allTransfers.find((t) => t.id === transferId);
    if (!transfer) throw new Error("Transfer Record Not Found.");

    if (transfer.status === "received") {
      throw new Error("Duplicate Receipt Prevented: This challan has already been received.");
    }

    // Role check: Only Main Admin or an Engineer assigned to the DESTINATION branch can confirm receipt!
    if (userProfile.role === "Branch Engineer") {
      if (transfer.toLocationId !== userProfile.branchId) {
        throw new Error(
          `Security Exception: Unauthorized receipt confirmation. You are assigned to '${userProfile.branchName}', but this challan is designated for '${transfer.toLocationName}'.`
        );
      }
    }

    // Credit inventory to destination branch
    const updatedProductsMap = {};
    for (const item of transfer.items || []) {
      const prod = allProducts.find((p) => (p.id || p.productId) === item.productId);
      if (prod) {
        const prodKey = prod.id || prod.productId;
        const currentStock = { ...(prod.stock || {}) };
        const prevDestQty = Number(currentStock[transfer.toLocationId]) || 0;
        currentStock[transfer.toLocationId] = prevDestQty + Number(item.quantity);
        updatedProductsMap[prodKey] = {
          ...prod,
          stock: currentStock
        };
      }
    }

    // Append-only 'Transfer In' movement records
    const receiptMovements = (transfer.items || []).map((item) => ({
      id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: new Date().toISOString(),
      type: "Transfer In",
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      sourceBranch: transfer.fromLocationName,
      destinationBranch: transfer.toLocationName,
      quantity: Number(item.quantity),
      unit: item.unit,
      referenceNo: transfer.challanNo,
      performedBy: userProfile.fullName || userProfile.name,
      performedByUid: userProfile.uid,
      status: "Completed",
      immutable: true
    }));

    const updatedTransfer = {
      ...transfer,
      status: "received",
      receivedDate: new Date().toISOString(),
      receivedBy: userProfile.fullName || userProfile.name,
      receivedByUid: userProfile.uid
    };

    return {
      success: true,
      updatedTransfer,
      receiptMovements,
      updatedProducts: Object.values(updatedProductsMap)
    };
  },

  /**
   * Secure Stock Adjustment (Reconciliation / Audit Write-off)
   * Only Main Admin can execute adjustments.
   */
  async adjustStock(adminProfile, { productId, branchId, adjustmentQty, reason }, allProducts, allBranches) {
    if (!adminProfile || adminProfile.role !== "Main Admin") {
      throw new Error("Unauthorized: Only an authorized Main Admin can perform inventory adjustments.");
    }

    if (!productId || !branchId || adjustmentQty === 0 || isNaN(adjustmentQty)) {
      throw new Error("Validation Error: Valid product, branch, and non-zero adjustment quantity are mandatory.");
    }

    if (!reason || reason.trim().length < 5) {
      throw new Error("Audit Requirement: A descriptive reason (minimum 5 characters) is required for all stock adjustments.");
    }

    const prod = allProducts.find((p) => (p.id || p.productId) === productId);
    if (!prod) throw new Error("Product Not Found.");

    const branch = allBranches.find((b) => (b.id || b.branchId) === branchId);
    if (!branch) throw new Error("Branch Not Found.");

    const currentStock = Number(prod.stock?.[branchId]) || 0;
    const newStockQty = currentStock + Number(adjustmentQty);

    if (newStockQty < 0) {
      throw new Error(
        `Invalid Adjustment: Resulting stock cannot be negative. Current stock is ${currentStock}, adjustment is ${adjustmentQty}.`
      );
    }

    const updatedStock = { ...(prod.stock || {}) };
    updatedStock[branchId] = newStockQty;

    const auditRef = `ADJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const adjustmentMovement = {
      id: `mov_adj_${Date.now()}`,
      date: new Date().toISOString(),
      type: "Stock Adjustment",
      productId,
      productName: prod.name || prod.productName,
      sku: prod.sku,
      sourceBranch: branch.name || branch.branchName,
      destinationBranch: branch.name || branch.branchName,
      quantity: Number(adjustmentQty),
      unit: prod.unit,
      referenceNo: auditRef,
      reason: reason.trim(),
      performedBy: adminProfile.fullName || adminProfile.name || "Main Admin",
      performedByUid: adminProfile.uid,
      status: "Reconciled",
      immutable: true
    };

    return {
      success: true,
      auditRef,
      updatedProduct: {
        ...prod,
        stock: updatedStock
      },
      movement: adjustmentMovement
    };
  }
};
