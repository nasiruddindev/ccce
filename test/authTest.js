import { authService } from "../src/services/authService.js";

// Mock localStorage for Node environment testing
const store = {};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = String(val); },
  removeItem: (key) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

async function runTestSuite() {
  console.log("==========================================");
  console.log("RUNNING PHASE 2 AUTHENTICATION TEST SUITE");
  console.log("==========================================");

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`[PASS] Test ${total}: ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] Test ${total}: ${message}`);
      process.exitCode = 1;
    }
  }

  // 1. Invalid Credentials
  try {
    await authService.login("wrong@voltflow.com", "wrongpass");
    assert(false, "Invalid credentials should be rejected");
  } catch (err) {
    assert(err.message.includes("Invalid email or password"), "Invalid credentials rejected with proper error message");
  }

  // 2. Disabled Account Access
  try {
    await authService.login("disabled.user@voltflow.com", "user123");
    assert(false, "Disabled user should not be able to log in");
  } catch (err) {
    assert(err.message.includes("deactivated"), "Disabled account blocked with deactivation message");
  }

  // 3. Engineer Login
  try {
    const { user, profile } = await authService.login("engineer.tanvir@voltflow.com", "eng123");
    assert(user && profile.role === "Branch Engineer", "Engineer login succeeds with role 'Branch Engineer'");
    assert(profile.branchId === "loc_kaliakoir_230", "Engineer has verified assigned branch: Kaliakoir 230 KV");
  } catch (err) {
    assert(false, `Engineer login failed: ${err.message}`);
  }

  // 4. Role Restriction: Engineer cannot create accounts
  try {
    const engineerProfile = { role: "Branch Engineer", uid: "eng_test" };
    await authService.createEngineerAccount(engineerProfile, {
      fullName: "Hacked Admin",
      email: "hacked@voltflow.com",
      role: "Main Admin",
      branchId: "loc_gazaria_230"
    });
    assert(false, "Engineer must not be allowed to create accounts or promote to admin");
  } catch (err) {
    assert(err.message.includes("Unauthorized"), "Engineer account creation blocked: only Main Admin authorized");
  }

  // 5. Admin Login
  let adminProfile;
  try {
    const { user, profile } = await authService.login("admin@voltflow.com", "admin123");
    adminProfile = profile;
    assert(user && profile.role === "Main Admin", "Admin login succeeds with role 'Main Admin'");
  } catch (err) {
    assert(false, `Admin login failed: ${err.message}`);
  }

  // 6. Admin Account Creation for new Engineer with assigned branch
  try {
    const newEngineer = await authService.createEngineerAccount(adminProfile, {
      fullName: "Engr. Mahmudul Hasan",
      email: "mahmud.mirpur@voltflow.com",
      password: "securePass123",
      role: "Branch Engineer",
      branchId: "loc_mirpur_132",
      branchName: "Mirpur 132 KV Substation",
      department: "Metropolitan Grid Division"
    });
    assert(newEngineer && newEngineer.role === "Branch Engineer", "Admin successfully created new engineer account");
    assert(newEngineer.branchId === "loc_mirpur_132", "New engineer is assigned to exactly one branch: Mirpur 132 KV");
  } catch (err) {
    assert(false, `Admin account creation failed: ${err.message}`);
  }

  // 7. Logout test
  try {
    await authService.logout();
    assert(localStorage.getItem("voltflow_current_auth_session") === null, "Logout clears session from persistent storage");
  } catch (err) {
    assert(false, `Logout failed: ${err.message}`);
  }

  console.log("==========================================");
  console.log(`RESULTS: ${passed}/${total} TESTS PASSED!`);
  console.log("==========================================");
}

runTestSuite();
