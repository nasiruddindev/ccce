import assert from "assert";
import { authService } from "../src/services/authService.js";
import { productService } from "../src/services/productService.js";
import { branchService } from "../src/services/branchService.js";
import { transferService } from "../src/services/transferService.js";

console.log("================================================================");
console.log("🧪 RUNNING SUITE: Sub-Engineer Strict RBAC Lockdown Verification");
console.log("================================================================\n");

const adminProfile = {
  uid: "usr_admin_001",
  fullName: "Engr. Rafiqul Islam",
  role: "Main Admin",
  branchId: "loc_ccce_main",
  isActive: true
};

const mockBranches = [
  { id: "loc_ccce_main", name: "CCCE Central Main Branch", isMain: true, status: "Active" },
  { id: "loc_gazaria_230", name: "Gazaria 230 KV Substation", isMain: false, status: "Active" },
  { id: "loc_kaliakoir_230", name: "Kaliakoir 230 KV Substation", isMain: false, status: "Active" }
];

const mockProducts = [
  {
    id: "prod_001",
    name: "230KV Cable",
    sku: "CBL-230-TEST",
    unit: "Meters",
    status: "Active",
    stock: { loc_ccce_main: 1000, loc_gazaria_230: 200, loc_kaliakoir_230: 100 }
  }
];

let passed = 0;
let total = 0;

async function test(name, fn) {
  total++;
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function run() {
  const testSubEngEmail = `subeng_${Date.now()}@ccce.com.bd`;
  let createdEngineer = null;

  // 1. Admin provisions sub engineer
  await test("1. Admin provisions new Sub Engineer", async () => {
    createdEngineer = await authService.createEngineerAccount(adminProfile, {
      fullName: "Engr. Hasan Mahmud",
      email: testSubEngEmail,
      password: "password123",
      branchId: "loc_kaliakoir_230",
      branchName: "Kaliakoir 230 KV Substation"
    });
    assert.strictEqual(createdEngineer.role, "Branch Engineer", "Role MUST be 'Branch Engineer'");
    assert.strictEqual(createdEngineer.branchId, "loc_kaliakoir_230");
  });

  // 2. Sub engineer logs in and profile role is verified
  let loginResult = null;
  await test("2. Sub Engineer logs in with strict role 'Branch Engineer'", async () => {
    loginResult = await authService.login(testSubEngEmail, "password123");
    assert.strictEqual(loginResult.profile.role, "Branch Engineer");
    assert.strictEqual(loginResult.profile.role !== "Main Admin", true);
    assert.strictEqual(loginResult.profile.branchId, "loc_kaliakoir_230");
  });

  const subEngProfile = loginResult.profile;

  // 3. Sub Engineer CANNOT create products
  await test("3. Sub Engineer blocked from creating products (Admin-only)", async () => {
    let errorThrown = false;
    try {
      await productService.createProduct(subEngProfile, {
        productName: "Illegal Product",
        sku: "ILL-001"
      });
    } catch (err) {
      errorThrown = true;
      assert.ok(err.message.includes("Unauthorized") || err.message.includes("Main Admin"));
    }
    assert.strictEqual(errorThrown, true);
  });

  // 4. Sub Engineer CANNOT create branches
  await test("4. Sub Engineer blocked from creating branches (Admin-only)", async () => {
    let errorThrown = false;
    try {
      await branchService.createBranch(subEngProfile, {
        branchName: "Illegal Substation",
        branchCode: "ILL-SUB"
      });
    } catch (err) {
      errorThrown = true;
      assert.ok(err.message.includes("Unauthorized") || err.message.includes("Main Admin"));
    }
    assert.strictEqual(errorThrown, true);
  });

  // 5. Sub Engineer CANNOT deactivate branches
  await test("5. Sub Engineer blocked from deactivating branches (Admin-only)", async () => {
    let errorThrown = false;
    try {
      await branchService.toggleBranchStatus(subEngProfile, "loc_gazaria_230", "Inactive");
    } catch (err) {
      errorThrown = true;
      assert.ok(err.message.includes("Unauthorized") || err.message.includes("Main Admin"));
    }
    assert.strictEqual(errorThrown, true);
  });

  // 6. Sub Engineer CANNOT create other user accounts
  await test("6. Sub Engineer blocked from provisioning user accounts (Admin-only)", async () => {
    let errorThrown = false;
    try {
      await authService.createEngineerAccount(subEngProfile, {
        fullName: "Another Person",
        email: "another@ccce.com.bd",
        branchId: "loc_gazaria_230"
      });
    } catch (err) {
      errorThrown = true;
      assert.ok(err.message.includes("Unauthorized") || err.message.includes("Main Admin"));
    }
    assert.strictEqual(errorThrown, true);
  });

  // 7. Sub Engineer CANNOT transfer from unassigned substation
  await test("7. Sub Engineer blocked from transferring from unassigned substation (Gazaria)", async () => {
    let errorThrown = false;
    try {
      await transferService.createTransfer(
        subEngProfile,
        {
          fromLocationId: "loc_gazaria_230", // Gazaria is NOT his station (Assigned is Kaliakoir)
          toLocationId: "loc_ccce_main",
          items: [{ productId: "prod_001", quantity: 5 }]
        },
        mockProducts,
        mockBranches
      );
    } catch (err) {
      errorThrown = true;
      assert.ok(err.message.includes("Security Exception") || err.message.includes("Unauthorized source"));
    }
    assert.strictEqual(errorThrown, true);
  });

  // 8. Sub Engineer CANNOT record material usage for unassigned substation
  await test("8. Sub Engineer blocked from recording material usage at unassigned substation", async () => {
    let errorThrown = false;
    try {
      await transferService.recordMaterialUsage(
        subEngProfile,
        {
          productId: "prod_001",
          branchId: "loc_gazaria_230", // Gazaria is NOT his station
          quantity: 2,
          taskDescription: "Illegal usage test"
        },
        mockProducts,
        mockBranches
      );
    } catch (err) {
      errorThrown = true;
      assert.ok(err.message.includes("Security Exception") || err.message.includes("Unauthorized substation"));
    }
    assert.strictEqual(errorThrown, true);
  });

  console.log("\n----------------------------------------------------------------");
  console.log(`📊 Suite Results: ${passed}/${total} passed (${Math.round((passed / total) * 100)}%)`);
  console.log("================================================================\n");

  if (passed !== total) process.exit(1);
}

run();
