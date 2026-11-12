import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase.js";
import { initialProducts } from "../mockData.js";

// Safe Storage fallback for browser and Node.js testing
const memoryStore = {};
const safeStorage = {
  getItem: (key) => (typeof localStorage !== "undefined" ? localStorage.getItem(key) : memoryStore[key]),
  setItem: (key, val) => (typeof localStorage !== "undefined" ? localStorage.setItem(key, val) : (memoryStore[key] = val))
};

// Fallback storage key for offline or local testing
const STORAGE_KEY = "voltflow_products_v3";

const getLocalProducts = () => {
  const saved = safeStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }
  // Standardize initial products to match Phase 3 schema
  const standardized = initialProducts.map((p) => ({
    productId: p.id,
    productName: p.name,
    sku: p.sku,
    categoryId: p.categoryId || "cat_1",
    categoryName: p.category,
    brand: p.brand,
    modelNumber: p.modelNumber || p.sku,
    imageUrl: p.image,
    unit: p.unit,
    description: p.specs || "",
    minimumStockLevel: p.minAlertLevel || 100,
    unitPrice: p.unitPrice || 100,
    status: "Active",
    stock: p.stock || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
  safeStorage.setItem(STORAGE_KEY, JSON.stringify(standardized));
  return standardized;
};

export const productService = {
  /**
   * Fetch all products from Firestore with optional filtering
   */
  async getProducts({ categoryId = "all", search = "", status = "all" } = {}) {
    let list = [];

    if (isFirebaseConfigured && db) {
      try {
        const prodCol = collection(db, "products");
        const snapshot = await getDocs(prodCol);

        if (snapshot.empty) {
          // Auto-seed Firestore on first run so database has real records
          list = await this.seedInitialProducts();
        } else {
          list = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            productId: docSnap.id,
            ...docSnap.data()
          }));
        }
      } catch (err) {
        console.warn("Firestore products fetch notice (falling back to cache):", err);
        list = getLocalProducts();
      }
    } else {
      list = getLocalProducts();
    }

    // Filter by search query (name, sku, brand, model)
    if (search && search.trim() !== "") {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.productName?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.modelNumber?.toLowerCase().includes(q)
      );
    }

    // Filter by Category
    if (categoryId && categoryId !== "all") {
      list = list.filter((p) => p.categoryId === categoryId || p.categoryName === categoryId);
    }

    // Filter by Status (Active, Archived)
    if (status && status !== "all") {
      list = list.filter((p) => (p.status || "Active") === status);
    }

    return list;
  },

  /**
   * Get single product by ID
   */
  async getProductById(id) {
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, "products", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return { id: snap.id, productId: snap.id, ...snap.data() };
        }
      } catch (err) {
        console.warn("Error getting product doc:", err);
      }
    }
    const local = getLocalProducts();
    return local.find((p) => p.productId === id || p.id === id) || null;
  },

  /**
   * Check if SKU is unique
   */
  async isSkuUnique(sku, excludeProductId = null) {
    const cleanSku = sku.trim().toUpperCase();

    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, "products"), where("sku", "==", cleanSku));
        const snapshot = await getDocs(q);
        const matches = snapshot.docs.filter((d) => d.id !== excludeProductId);
        return matches.length === 0;
      } catch (err) {
        console.warn("SKU check query fallback:", err);
      }
    }

    const local = getLocalProducts();
    const existing = local.find(
      (p) => p.sku.toUpperCase() === cleanSku && (p.productId || p.id) !== excludeProductId
    );
    return !existing;
  },

  /**
   * Create a new product (Enforces Admin permission & Unique SKU)
   */
  async createProduct(adminProfile, data) {
    if (!adminProfile || adminProfile.role !== "Main Admin") {
      throw new Error("Unauthorized: Only an authorized Main Admin can create products.");
    }

    if (!data.productName || !data.sku) {
      throw new Error("Product name and SKU are mandatory.");
    }

    const cleanSku = data.sku.trim().toUpperCase();

    // 1. Verify unique SKU
    const isUnique = await this.isSkuUnique(cleanSku);
    if (!isUnique) {
      throw new Error(`Duplicate SKU Error: A product with SKU '${cleanSku}' already exists. SKU must be unique.`);
    }

    const docId = `prod_${Date.now()}`;
    const newProduct = {
      productId: docId,
      productName: data.productName.trim(),
      sku: cleanSku,
      categoryId: data.categoryId || "cat_1",
      categoryName: data.categoryName || "General Electrical",
      brand: data.brand || "Generic",
      modelNumber: data.modelNumber || cleanSku,
      imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150",
      unit: data.unit || "Meters",
      description: data.description || "",
      minimumStockLevel: Number(data.minimumStockLevel) || 50,
      unitPrice: Number(data.unitPrice) || 100,
      status: "Active",
      stock: data.stock || { loc_gazaria_230: 100 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "products", docId), {
          ...newProduct,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Firestore product creation error:", err);
      }
    }

    // Save locally
    const local = getLocalProducts();
    local.unshift(newProduct);
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(local));

    return newProduct;
  },

  /**
   * Update existing product
   */
  async updateProduct(adminProfile, productId, updateData) {
    if (!adminProfile || adminProfile.role !== "Main Admin") {
      throw new Error("Unauthorized: Only Main Admin can edit products.");
    }

    if (updateData.sku) {
      const cleanSku = updateData.sku.trim().toUpperCase();
      const isUnique = await this.isSkuUnique(cleanSku, productId);
      if (!isUnique) {
        throw new Error(`Duplicate SKU Error: Another product is already using SKU '${cleanSku}'.`);
      }
      updateData.sku = cleanSku;
    }

    const payload = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, "products", productId);
        await updateDoc(docRef, {
          ...payload,
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.error("Firestore product update error:", err);
      }
    }

    const local = getLocalProducts();
    const updated = local.map((p) => ((p.productId || p.id) === productId ? { ...p, ...payload } : p));
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    return payload;
  },

  /**
   * Archive product (Soft Delete — do not hard delete products with inventory history)
   */
  async archiveProduct(adminProfile, productId) {
    if (!adminProfile || adminProfile.role !== "Main Admin") {
      throw new Error("Unauthorized: Only Main Admin can archive products.");
    }

    const product = await this.getProductById(productId);
    if (!product) throw new Error("Product not found.");

    // Check inventory levels
    const totalQty = Object.values(product.stock || {}).reduce((sum, q) => sum + (Number(q) || 0), 0);
    const notice = totalQty > 0 
      ? `Product archived. (Preserved ${totalQty} units historical stock across branches)`
      : "Product successfully archived.";

    await this.updateProduct(adminProfile, productId, { status: "Archived" });
    return { success: true, message: notice };
  },

  /**
   * Restore an archived product
   */
  async restoreProduct(adminProfile, productId) {
    if (!adminProfile || adminProfile.role !== "Main Admin") {
      throw new Error("Unauthorized: Only Main Admin can restore products.");
    }
    await this.updateProduct(adminProfile, productId, { status: "Active" });
    return { success: true, message: "Product restored to active catalog." };
  },

  /**
   * Seed Firestore 'products' collection if empty
   */
  async seedInitialProducts() {
    const list = getLocalProducts();
    if (isFirebaseConfigured && db) {
      for (const item of list) {
        const id = item.productId || item.id;
        await setDoc(doc(db, "products", id), {
          ...item,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    }
    return list;
  }
};
