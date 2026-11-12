import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase.js";
import { initialBranches } from "../mockData.js";
import { productService } from "./productService.js";

const memoryStore = {};
const safeStorage = {
  getItem: (key) => (typeof localStorage !== "undefined" ? localStorage.getItem(key) : memoryStore[key]),
  setItem: (key, val) => (typeof localStorage !== "undefined" ? localStorage.setItem(key, val) : (memoryStore[key] = val))
};

const STORAGE_KEY = "voltflow_branches_v3";

const getLocalBranches = () => {
  const saved = safeStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }
  const standardized = initialBranches.map((b) => ({
    branchId: b.id,
    branchName: b.name,
    branchCode: b.code,
    address: b.address || b.location,
    contactPerson: b.inCharge || "Station Engineer",
    phone: b.phone || "+880 1700-000000",
    email: b.email || "substation@voltflow.com",
    status: b.status || "Active",
    isMain: b.isMain || false,
    capacity: b.capacity || "25,000 sq ft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
  safeStorage.setItem(STORAGE_KEY, JSON.stringify(standardized));
  return standardized;
};

export const branchService = {
  /**
   * Get all branches
   */
  async getBranches({ search = "", status = "all" } = {}) {
    let list = [];

    if (isFirebaseConfigured && db) {
      try {
        const branchCol = collection(db, "branches");
        const snapshot = await getDocs(branchCol);

        if (snapshot.empty) {
          list = await this.seedInitialBranches();
        } else {
          list = snapshot.docs.map((d) => ({
            id: d.id,
            branchId: d.id,
            ...d.data()
          }));
        }
      } catch (err) {
        console.warn("Firestore branches fetch notice:", err);
        list = getLocalBranches();
      }
    } else {
      list = getLocalBranches();
    }

    if (search && search.trim() !== "") {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.branchName?.toLowerCase().includes(q) ||
          b.branchCode?.toLowerCase().includes(q) ||
          b.contactPerson?.toLowerCase().includes(q) ||
          b.address?.toLowerCase().includes(q)
      );
    }

    if (status && status !== "all") {
      list = list.filter((b) => (b.status || "Active") === status);
    }

    return list;
  },

  /**
   * Get single branch
   */
  async getBranchById(id) {
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, "branches", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return { id: snap.id, branchId: snap.id, ...snap.data() };
        }
      } catch (err) {
        console.warn("Error getting branch doc:", err);
      }
    }
    const local = getLocalBranches();
    return local.find((b) => b.branchId === id || b.id === id) || null;
  },

  /**
   * Check if Branch Code is unique
   */
  async isBranchCodeUnique(branchCode, excludeBranchId = null) {
    const cleanCode = branchCode.trim().toUpperCase();

    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, "branches"), where("branchCode", "==", cleanCode));
        const snapshot = await getDocs(q);
        const matches = snapshot.docs.filter((d) => d.id !== excludeBranchId);
        return matches.length === 0;
      } catch (err) {
        console.warn("Branch code check query fallback:", err);
      }
    }

    const local = getLocalBranches();
    const existing = local.find(
      (b) => b.branchCode.toUpperCase() === cleanCode && (b.branchId || b.id) !== excludeBranchId
    );
    return !existing;
  },

  /**
   * Add new branch (Admin only)
   */
  async createBranch(adminProfile, data) {
    if (!adminProfile || adminProfile.role !== "Main Admin") {
      throw new Error("Unauthorized: Only Main Admin can add substation branches.");
    }

    if (!data.branchName || !data.branchCode) {
      throw new Error("Branch name and unique branch code are mandatory.");
    }

    const cleanCode = data.branchCode.trim().toUpperCase();

    // Verify unique branch code
    const isUnique = await this.isBranchCodeUnique(cleanCode);
    if (!isUnique) {
      throw new Error(`Duplicate Code Error: A branch with code '${cleanCode}' already exists. Branch codes must be unique.`);
    }

    const docId = `loc_${Date.now()}`;
    const newBranch = {
      branchId: docId,
      branchName: data.branchName.trim(),
      branchCode: cleanCode,
      address: data.address || "",
      contactPerson: data.contactPerson || "Station Lead",
      phone: data.phone || "+880 1700-000000",
      email: data.email || "",
      status: "Active",
      isMain: false,
      capacity: data.capacity || "20,000 sq ft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "branches", docId), {
          ...newBranch,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Firestore branch creation error:", err);
      }
    }

    const local = getLocalBranches();
    local.push(newBranch);
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(local));

    return newBranch;
  },

  /**
   * Edit branch
   */
  async updateBranch(adminProfile, branchId, updateData) {
    if (!adminProfile || adminProfile.role !== "Main Admin") {
      throw new Error("Unauthorized: Only Main Admin can edit branch details.");
    }

    if (updateData.branchCode) {
      const cleanCode = updateData.branchCode.trim().toUpperCase();
      const isUnique = await this.isBranchCodeUnique(cleanCode, branchId);
      if (!isUnique) {
        throw new Error(`Duplicate Code Error: Another branch is already using code '${cleanCode}'.`);
      }
      updateData.branchCode = cleanCode;
    }

    const payload = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, "branches", branchId);
        await updateDoc(docRef, {
          ...payload,
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Firestore branch update error:", err);
      }
    }

    const local = getLocalBranches();
    const updated = local.map((b) => ((b.branchId || b.id) === branchId ? { ...b, ...payload } : b));
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    return payload;
  },

  /**
   * Activate / Deactivate Branch
   * SAFETY RULE: Do not delete branches with existing inventory or historical transactions!
   */
  async toggleBranchStatus(adminProfile, branchId, newStatus) {
    if (!adminProfile || adminProfile.role !== "Main Admin") {
      throw new Error("Unauthorized: Only Main Admin can change branch activation status.");
    }

    const branch = await this.getBranchById(branchId);
    if (!branch) throw new Error("Branch not found.");

    if (branch.isMain && newStatus === "Inactive") {
      throw new Error("Action Denied: Central Grid Hub (Main Branch) cannot be deactivated.");
    }

    await this.updateBranch(adminProfile, branchId, { status: newStatus });
    return { success: true, message: `Branch '${branch.branchName}' status updated to ${newStatus}.` };
  },

  /**
   * Get assigned engineers for a branch
   */
  async getAssignedEngineers(branchId) {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(
          collection(db, "users"),
          where("branchId", "==", branchId),
          where("role", "==", "Branch Engineer")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }));
      } catch (err) {
        console.warn("Firestore assigned engineers fetch error:", err);
      }
    }

    const saved = safeStorage.getItem("voltflow_auth_users");
    const users = saved ? JSON.parse(saved) : [];
    return users.filter((u) => u.branchId === branchId && u.role === "Branch Engineer");
  },

  /**
   * Seed branches if empty
   */
  async seedInitialBranches() {
    const list = getLocalBranches();
    if (isFirebaseConfigured && db) {
      for (const item of list) {
        const id = item.branchId || item.id;
        await setDoc(doc(db, "branches", id), {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    }
    return list;
  }
};
