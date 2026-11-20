import assert from "assert";
import { authService } from "../src/services/authService.js";

async function runPasswordTests() {
  console.log("==========================================");
  console.log("RUNNING PASSWORD CHANGE & RESET TEST SUITE");
  console.log("==========================================");

  // 1. Login as Admin
  const adminLogin = await authService.login("admin@ccce.com.bd", "admin123");
  assert.strictEqual(adminLogin.profile.role, "Main Admin", "Admin role matches");
  console.log("[PASS] Test 1: Admin logged in successfully");

  // 2. Admin creates a new engineer account
  const testEmail = `eng_${Date.now()}@ccce.com.bd`;
  const engineer = await authService.createEngineerAccount(adminLogin.profile, {
    fullName: "Md. Test Engineer",
    email: testEmail,
    password: "Password123!",
    branchId: "loc_kaliakoir_230",
    branchName: "Kaliakoir 230 KV Substation"
  });
  console.log("[PASS] Test 2: Admin provisioned engineer account:", engineer.email);

  // 3. Reject password under 6 characters
  try {
    await authService.adminResetUserPassword(adminLogin.profile, engineer.uid, engineer.email, "123");
    assert.fail("Should have thrown length error");
  } catch (err) {
    assert(err.message.includes("at least 6 characters"), "Validated min 6 chars");
    console.log("[PASS] Test 3: Password length < 6 rejected");
  }

  // 4. Admin resets engineer password to 'NewEngrPass@2026'
  const resetRes = await authService.adminResetUserPassword(
    adminLogin.profile,
    engineer.uid,
    engineer.email,
    "NewEngrPass@2026"
  );
  assert.strictEqual(resetRes.success, true);
  console.log("[PASS] Test 4: Admin successfully reset engineer's password");

  // 5. Engineer logs in with the NEW password
  const newLogin = await authService.login(testEmail, "NewEngrPass@2026");
  assert.strictEqual(newLogin.profile.email, testEmail);
  console.log("[PASS] Test 5: Engineer successfully logged in with the reset password");

  // 6. Engineer changes their own password via profile self-service
  const selfChangeRes = await authService.changeCurrentUserPassword("NewEngrPass@2026", "MySecretPass#2026");
  assert.strictEqual(selfChangeRes.success, true);
  console.log("[PASS] Test 6: Engineer changed their own password via changeCurrentUserPassword");

  // 7. Verify login with the updated password
  const finalLogin = await authService.login(testEmail, "MySecretPass#2026");
  assert.strictEqual(finalLogin.profile.email, testEmail);
  console.log("[PASS] Test 7: Engineer successfully logged in with newly self-changed password");

  console.log("==========================================");
  console.log("ALL 7 PASSWORD TESTS PASSED PERFECTLY!");
  console.log("==========================================");
}

runPasswordTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
