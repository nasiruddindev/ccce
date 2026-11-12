import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase.js";
import { initialCategories } from "../mockData.js";
import { productService } from "./productService.js";

const memoryStore = {};
const safeStorage = {
  getItem: (key) => (typeof localStorage !== "undefined" ? localStorage.getItem(key) : memoryStore[key]),
  setItem: (key, val) => (typeof localStorage !== "undefined" ? localStorage.setItem(key, val) : (memoryStore[key] = val))
};

const STORAGE_KEY = "voltflow_categories_v3";

const getLocalCategories = () => {
  const saved = safeStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }
  const standardized = initialCategories.map((c) => ({
    categoryId: c.id,
    name: c.name,
    code: c.code,
    description: c.description || "",
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
  safeStorage.setItem(STORAGE_KEY, JSON.stringify(standardized));
  return standardized;
};

export const categoryService = {
  /**
   * Get all categories with optional search and status filter
   */
  async getCategories({ search = "", status = "all" } = {}) {
    let list = [];

    if (isFirebaseConfigured && db) {
      try {
        const catCol = collection(db, "categories");
        const snapshot = await getDocs(catCol);

        if (snapshot.empty) {
          list = await this.seedInitialCategories();
        } else {
          list = snapshot.docs.map((d) => ({
            id: d.id,
            categoryId: d.id,
            ...d.data()
          }));
        }
      } catch (err) {
        console.warn("Firestore categories fetch notice:", err);
        list = getLocalCategories();
      }
    } else {
      list = getLocalCategories();
    }

    if (search && search.trim() !== "") {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q));
    }

    if (status && status !== "all") {
      list = list.filter((c) => (c.status || "Active") === status);
    }

    return list;
  },

  /**
   * Create a new category (Admin only)
   */
  async createCategory(adminProfile, data) {
    if (!adminProfile || adminProfile.role !== "Main Admin") {
      throw new Error("Unauthorized: Only Main Admin can create categories.");
    }

    if (!data.name || !data.code) {
      throw new Error("Category name and code are mandatory.");
    }

    const docId = `cat_${Date.now()}`;
    const newCat = {
      categoryId: docId,
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
      description: data.description || "",
      status: "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "categories", docId), {
          ...newCat,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Firestore category creation error:", err);
      }
    }

    const local = getLocalCategories();
    local.push(newCat);
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(local));

    return newCat;
  },

  /**
   * Update category
   */
  async updateCategory(adminProfile, categoryId, updateData) {
    if (!adminProfile || adminProfile.role !== "Main Admin") {
      throw new Error("Unauthorized: Only Main Admin can edit categories.");
    }

    const payload = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, "categories", categoryId);
        await updateDoc(docRef, {
          ...payload,
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Firestore category update error:", err);
      }
    }

    const local = getLocalCategories();
    const updated = local.map((c) => ((c.categoryId || c.id) === categoryId ? { ...c, ...payload } : c));
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    return payload;
  },

  /**
   * Archive category
   * SAFETY RULE: Prevent deletion/archival if category contains active products!
   */
  async archiveCategory(adminProfile, categoryId, categoryName) {
    if (!adminProfile || adminProfile.role !== "Main Admin") {
      throw new Error("Unauthorized: Only Main Admin can archive categories.");
    }

    // Check if any active products belong to this category
    const allProducts = await productService.getProducts({ status: "Active" });
    const activeProductsInCategory = allProducts.filter(
      (p) => p.categoryId === categoryId || p.categoryName === categoryName
    );

    if (activeProductsInCategory.length > 0) {
      throw new Error(
        `Action Denied: Cannot archive category '${categoryName}'. It currently contains ${activeProductsInCategory.length} active products. Please reassign or archive those products first.`
      );
    }

    await this.updateCategory(adminProfile, categoryId, { status: "Archived" });
    return { success: true, message: `Category '${categoryName}' archived successfully.` };
  },

  /**
   * Restore archived category
   */
  async restoreCategory(adminProfile, categoryId) {
    if (!adminProfile || adminProfile.role !== "Main Admin") {
      throw new Error("Unauthorized: Only Main Admin can restore categories.");
    }
    await this.updateCategory(adminProfile, categoryId, { status: "Active" });
    return { success: true, message: "Category restored to active status." };
  },

  /**
   * Seed categories if empty
   */
  async seedInitialCategories() {
    const list = getLocalCategories();
    if (isFirebaseConfigured && db) {
      for (const item of list) {
        const id = item.categoryId || item.id;
        await setDoc(doc(db, "categories", id), {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    }
    return list;
  }
};
