import assert from "assert";
import { transferService } from "../src/services/transferService.js";

console.log("================================================================");
console.log("🧪 RUNNING SUITE: Material Usage ('In Use This Branch') & RBAC Test");
console.log("================================================================\n");

const mockBranches = [
  { id: "loc_gazaria_230", name: "Gazaria 230 KV Substation", code: "GZR-230", status: "Active", isMain: true },
  { id: "loc_megnaghat_400", name: "Megnaghat 400 KV Substation", code: "MGN-400", status: "Active" },
  { id: "loc_bhulta_132", name: "Bhulta 132 KV Substation", code: "BLT-132", status: "Active" }
];

const mockProducts = [
  {
    id: "prod_001",
    sku: "CBL-230KV-01",
    name: "230KV XLPE High-Voltage Underground Cable",
    unit: "Meters",
    status: "Active",
    stock: {
      loc_gazaria_230: 250,
      loc_megnaghat_400: 80,
      loc_bhulta_132: 20
    }
  },
  {
    id: "prod_002",
    sku: "CB-230-SF6",
    name: "230KV SF6 Circuit Breaker Interrupter",
    unit: "Units",
    status: "Active",
    stock: {
      loc_gazaria_230: 15,
      loc_megnaghat_400: 4,
      loc_bhulta_132: 0
    }
  }
];

const mainAdminUser = {
  uid: "usr_admin_001",
  fullName: "Engr. Rafiqul Islam",
  role: "Main Admin",
  branchId: "loc_gazaria_230",
  isActive: true
};

const megnaghatEngineer = {
  uid: "usr_eng_002",
  fullName: "Engr. Tanvir Ahmed",
  role: "Branch Engineer",
  branchId: "loc_megnaghat_400",
  branchName: "Megnaghat 400 KV Substation",
  isActive: true
};

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function runAsyncTest(name, fn) {
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

async function main() {
  // Test 1: Main Admin can record material usage for ANY substation
  await runAsyncTest("Main Admin can record material usage for any substation (Megnaghat)", async () => {
    const res = await transferService.recordMaterialUsage(
      mainAdminUser,
      {
        productId: "prod_001",
        branchId: "loc_megnaghat_400",
        quantity: 30,
        taskDescription: "Megnaghat transformer bay 1 cabling replacement"
      },
      mockProducts,
      mockBranches
    );

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.updatedProduct.stock.loc_megnaghat_400, 50); // 80 - 30 = 50
    assert.strictEqual(res.movement.type, "In Use (This Branch)");
    assert.strictEqual(res.movement.quantity, -30);
    assert.strictEqual(res.movement.sourceBranch, "Megnaghat 400 KV Substation");
    assert.ok(res.movement.referenceNo.startsWith("USE-"));
    assert.ok(res.movement.reason.includes("Megnaghat transformer bay"));
  });

  // Test 2: Branch Engineer can record material usage for their OWN substation
  await runAsyncTest("Branch Engineer can record material usage for their assigned station", async () => {
    const res = await transferService.recordMaterialUsage(
      megnaghatEngineer,
      {
        productId: "prod_002",
        branchId: "loc_megnaghat_400",
        quantity: 2,
        taskDescription: "Circuit breaker contact overhaul"
      },
      mockProducts,
      mockBranches
    );

    assert.strictEqual(res.success, true);
    assert.strictEqual(res.updatedProduct.stock.loc_megnaghat_400, 2); // 4 - 2 = 2
    assert.strictEqual(res.movement.type, "In Use (This Branch)");
    assert.strictEqual(res.movement.performedBy, "Engr. Tanvir Ahmed");
  });

  // Test 3: Branch Engineer CANNOT record material usage for another substation (Security Exception)
  await runAsyncTest("Branch Engineer is blocked from recording material usage at another substation", async () => {
    let errorThrown = false;
    try {
      await transferService.recordMaterialUsage(
        megnaghatEngineer,
        {
          productId: "prod_001",
          branchId: "loc_gazaria_230", // Not his assigned station!
          quantity: 10,
          taskDescription: "Illegal attempt to consume Gazaria cables"
        },
        mockProducts,
        mockBranches
      );
    } catch (err) {
      errorThrown = true;
      assert.ok(err.message.includes("Security Exception"));
      assert.ok(err.message.includes("solely for your assigned substation"));
    }
    assert.strictEqual(errorThrown, true, "Should have thrown Security Exception");
  });

  // Test 4: Insufficient stock check correctly prevents material usage
  await runAsyncTest("Insufficient stock at substation prevents material usage", async () => {
    let errorThrown = false;
    try {
      await transferService.recordMaterialUsage(
        megnaghatEngineer,
        {
          productId: "prod_002",
          branchId: "loc_megnaghat_400",
          quantity: 999, // Exceeds available 4
          taskDescription: "Overconsumption test"
        },
        mockProducts,
        mockBranches
      );
    } catch (err) {
      errorThrown = true;
      assert.ok(err.message.includes("Insufficient Stock"));
    }
    assert.strictEqual(errorThrown, true, "Should have thrown Insufficient Stock error");
  });

  // Test 5: Transfer RBAC - Branch Engineer can transfer ONLY from assigned substation
  await runAsyncTest("Branch Engineer can dispatch transfer originating from assigned substation", async () => {
    const res = await transferService.createTransfer(
      megnaghatEngineer,
      {
        fromLocationId: "loc_megnaghat_400",
        toLocationId: "loc_bhulta_132",
        items: [{ productId: "prod_001", productName: "230KV Cable", sku: "CBL-230KV-01", unit: "Meters", quantity: 15 }]
      },
      mockProducts,
      mockBranches
    );
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.transfer.fromLocationId, "loc_megnaghat_400");
  });

  // Test 6: Transfer RBAC - Branch Engineer CANNOT transfer originating from another substation
  await runAsyncTest("Branch Engineer cannot dispatch transfer from an unassigned substation", async () => {
    let errorThrown = false;
    try {
      await transferService.createTransfer(
        megnaghatEngineer,
        {
          fromLocationId: "loc_gazaria_230", // Gazaria is NOT his station
          toLocationId: "loc_bhulta_132",
          items: [{ productId: "prod_001", productName: "230KV Cable", sku: "CBL-230KV-01", unit: "Meters", quantity: 10 }]
        },
        mockProducts,
        mockBranches
      );
    } catch (err) {
      errorThrown = true;
      assert.ok(err.message.includes("Security Exception"));
      assert.ok(err.message.includes("Unauthorized source substation"));
    }
    assert.strictEqual(errorThrown, true, "Should have thrown Security Exception");
  });

  // Test 7: Main Admin CAN transfer from ANY substation
  await runAsyncTest("Main Admin can dispatch transfer from any substation", async () => {
    const res = await transferService.createTransfer(
      mainAdminUser,
      {
        fromLocationId: "loc_megnaghat_400",
        toLocationId: "loc_gazaria_230",
        items: [{ productId: "prod_001", productName: "230KV Cable", sku: "CBL-230KV-01", unit: "Meters", quantity: 5 }]
      },
      mockProducts,
      mockBranches
    );
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.transfer.fromLocationId, "loc_megnaghat_400");
  });

  console.log("\n----------------------------------------------------------------");
  console.log(`📊 Suite Results: ${passed}/${total} passed (${Math.round((passed / total) * 100)}%)`);
  console.log("================================================================\n");

  if (passed !== total) {
    process.exit(1);
  }
}

main();
