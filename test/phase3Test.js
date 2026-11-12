import { productService } from "../src/services/productService.js";
import { categoryService } from "../src/services/categoryService.js";
import { branchService } from "../src/services/branchService.js";
import { authService } from "../src/services/authService.js";

// Mock profiles for testing RBAC
const mockAdmin = {
  uid: "admin_test_01",
  email: "admin@voltflow.com",
  role: "Main Admin",
  branchId: "loc_gazaria_230"
};

const mockEngineer = {
  uid: "eng_test_02",
  email: "engineer@voltflow.com",
  role: "Branch Engineer",
  branchId: "loc_kaliakoir_230"
};

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runPhase3Tests() {
  console.log("\n=======================================================");
  console.log("⚡ VOLTFLOW PHASE 3: VERIFICATION & AUDIT SUITE");
  console.log("=======================================================\n");

  // -------------------------------------------------------------------------
  // 1. PRODUCT MANAGEMENT TESTS
  // -------------------------------------------------------------------------
  console.log("--- 1. Testing Product Management ---");

  const testSku = `TEST-CBL-${Date.now()}`;
  let createdProduct = null;

  // Test 1.1: Admin can create product
  try {
    createdProduct = await productService.createProduct(mockAdmin, {
      productName: "High Voltage Underground XLPE Cable 33kV",
      sku: testSku,
      categoryName: "Cables & Wires",
      brand: "BRB Cable",
      unit: "Meters",
      minimumStockLevel: 50,
      unitPrice: 1250,
      stock: { loc_gazaria_230: 500 }
    });
    assert(createdProduct && createdProduct.sku === testSku, "Admin can create a new product");
  } catch (err) {
    assert(false, `Admin product creation failed: ${err.message}`);
  }

  // Test 1.2: Duplicate SKU rejection
  try {
    await productService.createProduct(mockAdmin, {
      productName: "Duplicate SKU Attempt",
      sku: testSku,
      categoryName: "Cables & Wires"
    });
    assert(false, "System allowed duplicate SKU (Should have rejected)");
  } catch (err) {
    assert(
      err.message.includes("Duplicate SKU Error") || err.message.includes("already exists"),
      `Duplicate SKU correctly rejected: ${err.message}`
    );
  }

  // Test 1.3: Engineer cannot create product
  try {
    await productService.createProduct(mockEngineer, {
      productName: "Hacker Product",
      sku: `HACK-${Date.now()}`
    });
    assert(false, "Engineer was permitted to create product (Should be unauthorized)");
  } catch (err) {
    assert(
      err.message.includes("Unauthorized"),
      `Engineer creation attempt blocked with 403: ${err.message}`
    );
  }

  // Test 1.4: Archive Product (Soft Delete preserving inventory)
  if (createdProduct) {
    try {
      const res = await productService.archiveProduct(mockAdmin, createdProduct.productId || createdProduct.id);
      assert(res.success === true, "Admin can archive product without losing historical data");
      const fetched = await productService.getProductById(createdProduct.productId || createdProduct.id);
      assert(fetched.status === "Archived", "Product marked as Archived in database");
    } catch (err) {
      assert(false, `Archiving failed: ${err.message}`);
    }
  }

  // -------------------------------------------------------------------------
  // 2. CATEGORY MANAGEMENT TESTS
  // -------------------------------------------------------------------------
  console.log("\n--- 2. Testing Category Management ---");

  const testCatCode = `CAT${Math.floor(Math.random() * 900 + 100)}`;
  let createdCategory = null;

  // Test 2.1: Admin can create category
  try {
    createdCategory = await categoryService.createCategory(mockAdmin, {
      name: `Special Grid Relays ${Date.now()}`,
      code: testCatCode,
      description: "Numerical and differential protection relays"
    });
    assert(createdCategory && createdCategory.code === testCatCode, "Admin can create a category");
  } catch (err) {
    assert(false, `Category creation failed: ${err.message}`);
  }

  // Test 2.2: Engineer cannot create category
  try {
    await categoryService.createCategory(mockEngineer, {
      name: "Engineer Unauthorized Category",
      code: "EUC"
    });
    assert(false, "Engineer created category (Should be unauthorized)");
  } catch (err) {
    assert(err.message.includes("Unauthorized"), "Engineer category creation blocked");
  }

  // Test 2.3: Cannot archive category containing active products
  try {
    // "Cables & Wires" contains active products
    await categoryService.archiveCategory(mockAdmin, "cat_1", "Cables & Wires");
    assert(false, "System allowed archiving category with active products (Should be blocked)");
  } catch (err) {
    assert(
      err.message.includes("Action Denied") || err.message.includes("contains"),
      `Category with active products protected from archiving: ${err.message}`
    );
  }

  // -------------------------------------------------------------------------
  // 3. BRANCH MANAGEMENT TESTS
  // -------------------------------------------------------------------------
  console.log("\n--- 3. Testing Branch Management ---");

  const testBranchCode = `SUB-TEST-${Math.floor(Math.random() * 900 + 100)}`;
  let createdBranch = null;

  // Test 3.1: Admin can create branch
  try {
    createdBranch = await branchService.createBranch(mockAdmin, {
      branchName: "Cox's Bazar 230 KV Grid Substation",
      branchCode: testBranchCode,
      address: "Cox's Bazar Beach Road, Chittagong",
      contactPerson: "Engr. Rezaul Karim",
      phone: "+880 1819-000000"
    });
    assert(createdBranch && createdBranch.branchCode === testBranchCode, "Admin can create substation branch");
  } catch (err) {
    assert(false, `Branch creation failed: ${err.message}`);
  }

  // Test 3.2: Duplicate Branch Code rejection
  try {
    await branchService.createBranch(mockAdmin, {
      branchName: "Duplicate Substation",
      branchCode: testBranchCode
    });
    assert(false, "System allowed duplicate branch code (Should be rejected)");
  } catch (err) {
    assert(
      err.message.includes("Duplicate Code Error") || err.message.includes("already exists"),
      `Duplicate branch code correctly rejected: ${err.message}`
    );
  }

  // Test 3.3: Engineer cannot create branch
  try {
    await branchService.createBranch(mockEngineer, {
      branchName: "Unauthorized Substation",
      branchCode: "SUB-UNAUTH"
    });
    assert(false, "Engineer created branch (Should be unauthorized)");
  } catch (err) {
    assert(err.message.includes("Unauthorized"), "Engineer branch creation blocked");
  }

  // Test 3.4: Main Hub cannot be deactivated
  try {
    await branchService.toggleBranchStatus(mockAdmin, "loc_ccce_main", "Inactive");
    assert(false, "Central Hub was deactivated (Should be protected)");
  } catch (err) {
    assert(
      err.message.includes("Action Denied") || err.message.includes("Main Branch"),
      `Central Main Hub deactivation protected: ${err.message}`
    );
  }

  // Test 3.5: Regular branch can be deactivated
  if (createdBranch) {
    try {
      const res = await branchService.toggleBranchStatus(mockAdmin, createdBranch.branchId || createdBranch.id, "Inactive");
      assert(res.success === true, "Regular branch can be safely deactivated without deleting records");
    } catch (err) {
      assert(false, `Branch deactivation failed: ${err.message}`);
    }
  }

  // -------------------------------------------------------------------------
  // 4. USER & ROLE MANAGEMENT TESTS
  // -------------------------------------------------------------------------
  console.log("\n--- 4. Testing User & Role Management ---");

  // Test 4.1: Engineer cannot create engineer accounts
  try {
    await authService.createEngineerAccount(mockEngineer, {
      fullName: "Rogue Engineer",
      email: "rogue@voltflow.com",
      branchId: "loc_tangail_230"
    });
    assert(false, "Engineer was allowed to create account (Should be unauthorized)");
  } catch (err) {
    assert(
      err.message.includes("Unauthorized"),
      `Engineer account provisioning blocked for non-admin: ${err.message}`
    );
  }

  // Test 4.2: Admin can assign and reassign branches
  try {
    const res = await authService.updateUserRoleAndBranch(
      mockAdmin,
      mockEngineer.uid,
      "Branch Engineer",
      "loc_tangail_230",
      "Tangail 230 KV Substation"
    );
    assert(res.success === true, "Admin can reassign an engineer to a different substation branch");
  } catch (err) {
    assert(false, `Branch reassignment failed: ${err.message}`);
  }

  console.log("\n=======================================================");
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase3Tests();
