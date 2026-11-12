import { transferService } from "../src/services/transferService.js";
import { productService } from "../src/services/productService.js";
import { branchService } from "../src/services/branchService.js";
import { categoryService } from "../src/services/categoryService.js";
import { authService } from "../src/services/authService.js";
import { initialProducts, initialBranches, initialCategories, initialTransfers, initialMovements } from "../src/mockData.js";

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

// Mock User Profiles
const adminProfile = {
  uid: "usr_admin_001",
  email: "admin@voltflow.com",
  fullName: "Engr. Rafiqul Islam",
  role: "Main Admin",
  branchId: "loc_gazaria_230",
  branchName: "Gazaria 230 KV Substation",
  isActive: true
};

const kaliakoirEngineer = {
  uid: "usr_eng_002",
  email: "tanvir@voltflow.com",
  fullName: "Engr. Tanvir Ahmed",
  role: "Branch Engineer",
  branchId: "loc_kaliakoir_230",
  branchName: "Kaliakoir 230 KV Substation",
  isActive: true
};

const mirpurEngineer = {
  uid: "usr_eng_003",
  email: "mahmudul@voltflow.com",
  fullName: "Engr. Mahmudul Hasan",
  role: "Branch Engineer",
  branchId: "loc_mirpur_132",
  branchName: "Mirpur 132 KV Substation",
  isActive: true
};

const disabledUser = {
  uid: "usr_disabled_004",
  email: "suspended@voltflow.com",
  fullName: "Suspended Staff",
  role: "Branch Engineer",
  branchId: "loc_mirpur_132",
  isActive: false
};

async function runSecurityAudit() {
  console.log("\n=================================================================");
  console.log("🔒 VOLTFLOW PHASE 6: FIREBASE SECURITY HARDENING & QA AUDIT");
  console.log("=================================================================\n");

  // Deep clone data for pure test isolation
  const products = JSON.parse(JSON.stringify(initialProducts));
  const branches = JSON.parse(JSON.stringify(initialBranches));
  const transfers = JSON.parse(JSON.stringify(initialTransfers));
  const movements = JSON.parse(JSON.stringify(initialMovements));

  // ---------------------------------------------------------------------------
  // 1. AUTHENTICATION & ACCESS CONTROL AUDIT
  // ---------------------------------------------------------------------------
  console.log("--- 1. Authentication & Account Access Audit ---");

  // Test 1.1: Disabled account blocked from executing transfers
  try {
    await transferService.createTransfer(
      disabledUser,
      { fromLocationId: "loc_mirpur_132", toLocationId: "loc_gazaria_230", items: [{ productId: "prod_1", quantity: 10 }] },
      products,
      branches
    );
    assert(false, "Disabled account was permitted to execute transfer (Should be blocked)");
  } catch (err) {
    assert(err.message.includes("Account Disabled"), `Disabled account blocked: ${err.message}`);
  }

  // Test 1.2: Unauthenticated request blocked
  try {
    await transferService.createTransfer(
      null,
      { fromLocationId: "loc_mirpur_132", toLocationId: "loc_gazaria_230", items: [{ productId: "prod_1", quantity: 10 }] },
      products,
      branches
    );
    assert(false, "Unauthenticated transfer permitted (Should be blocked)");
  } catch (err) {
    assert(err.message.includes("Authentication Required"), `Unauthenticated request blocked: ${err.message}`);
  }

  // ---------------------------------------------------------------------------
  // 2. TRANSFER SERVICE RBAC & SCOPE VALIDATION AUDIT
  // ---------------------------------------------------------------------------
  console.log("\n--- 2. Transfer Service Security & Scope Validation ---");

  // Test 2.1: Unauthorized Source Branch - Engineer tries to dispatch from unassigned branch
  try {
    // Kaliakoir Engineer tries to dispatch from Gazaria 230 KV
    await transferService.createTransfer(
      kaliakoirEngineer,
      {
        fromLocationId: "loc_gazaria_230", // FORGED SOURCE
        toLocationId: "loc_kobirpur_230",
        items: [{ productId: "prod_1", quantity: 50 }]
      },
      products,
      branches
    );
    assert(false, "Engineer dispatched from an unassigned substation (Critical RBAC violation!)");
  } catch (err) {
    assert(
      err.message.includes("Security Exception") || err.message.includes("Unauthorized source"),
      `Engineer restricted to assigned substation: ${err.message}`
    );
  }

  // Test 2.2: Authorized Source Branch - Engineer dispatches from their own station
  try {
    const res = await transferService.createTransfer(
      kaliakoirEngineer,
      {
        fromLocationId: "loc_kaliakoir_230", // OWN ASSIGNED STATION
        toLocationId: "loc_kobirpur_230",
        items: [{ productId: "prod_1", quantity: 50 }]
      },
      products,
      branches
    );
    assert(res.success && res.transfer.fromLocationId === "loc_kaliakoir_230", "Engineer successfully dispatched from assigned substation");
  } catch (err) {
    assert(false, `Authorized dispatch failed: ${err.message}`);
  }

  // Test 2.3: Admin can dispatch from any substation
  try {
    const res = await transferService.createTransfer(
      adminProfile,
      {
        fromLocationId: "loc_gazaria_230",
        toLocationId: "loc_tangail_230",
        items: [{ productId: "prod_1", quantity: 100 }]
      },
      products,
      branches
    );
    assert(res.success === true, "Main Admin can dispatch from any grid substation");
  } catch (err) {
    assert(false, `Admin dispatch failed: ${err.message}`);
  }

  // ---------------------------------------------------------------------------
  // 3. INVENTORY INTEGRITY & INSUFFICIENT STOCK AUDIT
  // ---------------------------------------------------------------------------
  console.log("\n--- 3. Inventory Integrity & Insufficient Stock Audit ---");

  // Test 3.1: Insufficient Stock check
  try {
    // Prod 1 at Kaliakoir has 1500 units, request 99999 units
    await transferService.createTransfer(
      kaliakoirEngineer,
      {
        fromLocationId: "loc_kaliakoir_230",
        toLocationId: "loc_dhamrai_230",
        items: [{ productId: "prod_1", quantity: 99999 }]
      },
      products,
      branches
    );
    assert(false, "System allowed dispatching more stock than available (Overselling violation!)");
  } catch (err) {
    assert(err.message.includes("Insufficient Stock"), `Insufficient stock correctly caught: ${err.message}`);
  }

  // Test 3.2: Zero or negative quantity check
  try {
    await transferService.createTransfer(
      kaliakoirEngineer,
      {
        fromLocationId: "loc_kaliakoir_230",
        toLocationId: "loc_dhamrai_230",
        items: [{ productId: "prod_1", quantity: -20 }]
      },
      products,
      branches
    );
    assert(false, "System allowed negative quantity (Should be blocked)");
  } catch (err) {
    assert(err.message.includes("Invalid Quantity"), `Negative quantity blocked: ${err.message}`);
  }

  // Test 3.3: Fractional/Decimal quantity check
  try {
    await transferService.createTransfer(
      kaliakoirEngineer,
      {
        fromLocationId: "loc_kaliakoir_230",
        toLocationId: "loc_dhamrai_230",
        items: [{ productId: "prod_1", quantity: 12.5 }]
      },
      products,
      branches
    );
    assert(false, "System allowed non-integer quantity (Should be integer units)");
  } catch (err) {
    assert(err.message.includes("Invalid Quantity"), `Fractional quantity blocked: ${err.message}`);
  }

  // Test 3.4: Same source and destination check
  try {
    await transferService.createTransfer(
      adminProfile,
      {
        fromLocationId: "loc_gazaria_230",
        toLocationId: "loc_gazaria_230",
        items: [{ productId: "prod_1", quantity: 10 }]
      },
      products,
      branches
    );
    assert(false, "System allowed transfer where source === destination");
  } catch (err) {
    assert(err.message.includes("identical"), `Identical source/destination blocked: ${err.message}`);
  }

  // Test 3.5: Transferring an Archived Product check
  const archivedProd = { ...products[0], id: "prod_archived_test", status: "Archived" };
  products.push(archivedProd);
  try {
    await transferService.createTransfer(
      adminProfile,
      {
        fromLocationId: "loc_gazaria_230",
        toLocationId: "loc_dhamrai_230",
        items: [{ productId: "prod_archived_test", quantity: 10 }]
      },
      products,
      branches
    );
    assert(false, "System allowed transfer of archived product");
  } catch (err) {
    assert(err.message.includes("archived"), `Archived product transfer blocked: ${err.message}`);
  }

  // ---------------------------------------------------------------------------
  // 4. ATOMICITY, RECEIPT & IDEMPOTENCY AUDIT
  // ---------------------------------------------------------------------------
  console.log("\n--- 4. Atomicity, Delivery Receipt & Idempotency Audit ---");

  // Test 4.1: Atomic Source Deduction & Receipt Credit
  const testProd = products.find(p => p.id === "prod_1");
  const initSourceQty = Number(testProd.stock.loc_gazaria_230);
  const initDestQty = Number(testProd.stock.loc_tangail_230);
  const transferAmount = 250;

  const dispatchResult = await transferService.createTransfer(
    adminProfile,
    {
      fromLocationId: "loc_gazaria_230",
      toLocationId: "loc_tangail_230",
      items: [{ productId: "prod_1", productName: testProd.name, sku: testProd.sku, unit: testProd.unit, quantity: transferAmount }]
    },
    products,
    branches
  );

  const updatedSourceProd = dispatchResult.updatedProducts.find(p => p.id === "prod_1");
  assert(
    updatedSourceProd.stock.loc_gazaria_230 === initSourceQty - transferAmount,
    `Atomic Deduction: Source stock decreased from ${initSourceQty} to ${updatedSourceProd.stock.loc_gazaria_230}`
  );

  // Test 4.2: Unauthorized Receipt - Mirpur Engineer tries to confirm delivery for Tangail
  transfers.push(dispatchResult.transfer);
  try {
    await transferService.confirmTransferReceipt(
      mirpurEngineer, // Mirpur Engineer assigned to loc_mirpur_132
      dispatchResult.transfer.id,
      transfers,
      products
    );
    assert(false, "Engineer confirmed receipt for a different substation");
  } catch (err) {
    assert(err.message.includes("Security Exception"), `Cross-station receipt blocked: ${err.message}`);
  }

  // Test 4.3: Authorized Receipt by Main Admin or Designated Station Engineer
  const receiptResult = await transferService.confirmTransferReceipt(
    adminProfile,
    dispatchResult.transfer.id,
    transfers,
    products
  );
  assert(receiptResult.updatedTransfer.status === "received", "Transfer status updated to 'received'");
  const updatedDestProd = receiptResult.updatedProducts.find(p => p.id === "prod_1");
  assert(
    updatedDestProd.stock.loc_tangail_230 === initDestQty + transferAmount,
    `Atomic Credit: Destination stock credited from ${initDestQty} to ${updatedDestProd.stock.loc_tangail_230}`
  );

  // Test 4.4: Duplicate Receipt Protection (Cannot receive already received shipment)
  transfers.find(t => t.id === dispatchResult.transfer.id).status = "received";
  try {
    await transferService.confirmTransferReceipt(
      adminProfile,
      dispatchResult.transfer.id,
      transfers,
      products
    );
    assert(false, "System allowed duplicate receipt confirmation");
  } catch (err) {
    assert(err.message.includes("Duplicate Receipt Prevented"), `Duplicate receipt blocked: ${err.message}`);
  }

  // ---------------------------------------------------------------------------
  // 5. STOCK ADJUSTMENT & IMMUTABLE AUDIT LOG AUDIT
  // ---------------------------------------------------------------------------
  console.log("\n--- 5. Stock Adjustment & Immutability Audit ---");

  // Test 5.1: Engineer cannot perform stock adjustments
  try {
    await transferService.adjustStock(
      kaliakoirEngineer,
      { productId: "prod_1", branchId: "loc_kaliakoir_230", adjustmentQty: 10, reason: "Surplus" },
      products,
      branches
    );
    assert(false, "Engineer performed stock adjustment (Should be admin-only)");
  } catch (err) {
    assert(err.message.includes("Unauthorized"), `Engineer stock adjustment blocked: ${err.message}`);
  }

  // Test 5.2: Admin adjustment requires valid reason
  try {
    await transferService.adjustStock(
      adminProfile,
      { productId: "prod_1", branchId: "loc_gazaria_230", adjustmentQty: -5, reason: "bad" }, // < 5 chars
      products,
      branches
    );
    assert(false, "System accepted adjustment with insufficient reason");
  } catch (err) {
    assert(err.message.includes("Audit Requirement"), `Adjustment audit reason required: ${err.message}`);
  }

  // Test 5.3: Valid Admin Adjustment
  const adjResult = await transferService.adjustStock(
    adminProfile,
    { productId: "prod_1", branchId: "loc_gazaria_230", adjustmentQty: -10, reason: "Insulation damage during heavy rain" },
    products,
    branches
  );
  assert(adjResult.success && adjResult.movement.type === "Stock Adjustment", "Admin executed stock adjustment with immutable movement log");

  console.log("\n=================================================================");
  console.log(`SECURITY & QA AUDIT SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log("=================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityAudit();
