import { 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  updateProfile,
  getAuth
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query,
  where,
  serverTimestamp 
} from "firebase/firestore";
import { initializeApp, getApps, deleteApp } from "firebase/app";
import { auth, db, isFirebaseConfigured, getFirebaseConfig } from "./firebase.js";
import { initialUsers } from "../mockData.js";

const memoryStore = {};
const safeStorage = {
  getItem: (key) => (typeof localStorage !== "undefined" ? localStorage.getItem(key) : memoryStore[key]),
  setItem: (key, val) => (typeof localStorage !== "undefined" ? localStorage.setItem(key, val) : (memoryStore[key] = val))
};

// Fallback development mock users for instant testing when live Firebase keys are pending
const getLocalDevUsers = () => {
  const defaults = [
    {
      uid: "usr_admin_001",
      email: "admin@ccce.com.bd",
      password: "admin123",
      fullName: "Engr. Rafiqul Islam (Main Admin)",
      phone: "+880 1711-000001",
      role: "Main Admin",
      branchId: "loc_ccce_main",
      branchName: "CCCE Central Main Branch",
      department: "CCCE Central HQ & Executive Administration",
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];

  const saved = safeStorage.getItem("voltflow_auth_users");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Strip out legacy mock/demo users, keeping only admin@ccce.com.bd and newly created accounts
        const cleaned = parsed.filter(u => u.email === "admin@ccce.com.bd" || !u.email.includes("voltflow.com"));
        if (cleaned.length > 0) return cleaned;
      }
    } catch {}
  }

  safeStorage.setItem("voltflow_auth_users", JSON.stringify(defaults));
  return defaults;
};

export const authService = {
  /**
   * Authenticate user with Email and Password
   */
  async login(email, password) {
    if (!email || !password) {
      throw new Error("Please enter both email and password.");
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Live Firebase Authentication Mode
    if (isFirebaseConfigured && auth && db) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const user = userCredential.user;

        // Fetch verified user profile from Firestore 'users' collection
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        const isMasterAdmin = cleanEmail === "admin@ccce.com.bd";
        let profile = userDoc.exists() ? userDoc.data() : null;

        if (!profile) {
          // If no doc under user.uid, check if admin pre-created it with this email
          try {
            const q = query(collection(db, "users"), where("email", "==", cleanEmail));
            const snap = await getDocs(q);
            if (!snap.empty) {
              profile = snap.docs[0].data();
            }
          } catch (e) {
            console.warn("Firestore email query notice:", e);
          }

          // Also check local dev users
          if (!profile) {
            const localUsers = getLocalDevUsers();
            const foundLocal = localUsers.find(u => u.email.toLowerCase() === cleanEmail);
            if (foundLocal) {
              profile = { ...foundLocal };
            }
          }

          // STRICT RBAC: ONLY admin@ccce.com.bd gets Main Admin. All other accounts are Branch Engineer!
          const assignedRole = isMasterAdmin ? "Main Admin" : "Branch Engineer";
          const assignedBranch = profile?.branchId || (isMasterAdmin ? "loc_ccce_main" : "loc_kaliakoir_230");
          const assignedBranchName = profile?.branchName || (isMasterAdmin ? "CCCE Central Main Branch" : "Kaliakoir 230 KV Substation");

          // Preserve exact name entered by the admin during user creation!
          const realName = profile?.fullName || profile?.name || user.displayName || (isMasterAdmin ? "Engr. Rafiqul Islam (Main Admin)" : "Station Engineer");

          profile = {
            uid: user.uid,
            fullName: realName,
            name: realName,
            email: cleanEmail,
            phone: profile?.phone || "+880 1700-000000",
            role: assignedRole,
            branchId: assignedBranch,
            branchName: assignedBranchName,
            department: profile?.department || (isMasterAdmin ? "CCCE Central HQ & Executive Administration" : "Substation Field Operations"),
            isActive: profile?.isActive !== false,
            createdAt: serverTimestamp()
          };

          await setDoc(userDocRef, profile);
        } else {
          // If this user is NOT master admin, strictly ensure their role is Branch Engineer
          if (!isMasterAdmin) {
            profile.role = "Branch Engineer";
            if (profile.branchId === "loc_ccce_main") {
              profile.branchId = "loc_kaliakoir_230";
              profile.branchName = "Kaliakoir 230 KV Substation";
            }
            try {
              await updateDoc(userDocRef, {
                role: "Branch Engineer",
                branchId: profile.branchId,
                branchName: profile.branchName
              });
            } catch (err) {
              console.warn("Profile role correction notice:", err);
            }
          }
        }

        // Check if account has been disabled
        if (profile.isActive === false) {
          await signOut(auth);
          throw new Error("Your account has been deactivated. Please contact your Main Administrator.");
        }

        safeStorage.setItem("voltflow_current_auth_session", JSON.stringify({
          uid: profile.uid,
          email: profile.email,
          profile
        }));
        safeStorage.setItem("voltflow_role", profile.role);

        return { user, profile };
      } catch (err) {
        if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
          throw new Error("Invalid email or password. Please verify your credentials.");
        }
        if (err.code === "auth/user-disabled") {
          throw new Error("This account has been disabled by an administrator.");
        }
        throw err;
      }
    }

    // 2. Seamless Local Development Fallback Authentication
    const localUsers = getLocalDevUsers();
    const foundUser = localUsers.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);

    if (!foundUser) {
      throw new Error("Invalid email or password. Please verify your credentials.");
    }

    if (!foundUser.isActive) {
      throw new Error("Your account has been deactivated. Please contact your Main Administrator.");
    }

    // Return authenticated mock profile with strictly enforced role
    const isMasterAdmin = cleanEmail === "admin@ccce.com.bd" || cleanEmail === "admin@voltflow.com";
    const profile = { 
      ...foundUser,
      role: isMasterAdmin ? "Main Admin" : (foundUser.role || "Branch Engineer")
    };
    delete profile.password;

    safeStorage.setItem("voltflow_current_auth_session", JSON.stringify({
      uid: profile.uid,
      email: profile.email,
      profile
    }));
    safeStorage.setItem("voltflow_role", profile.role);

    return {
      user: { uid: profile.uid, email: profile.email, displayName: profile.fullName },
      profile
    };
  },

  /**
   * Log out currently authenticated session
   */
  async logout() {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    localStorage.removeItem("voltflow_current_auth_session");
  },

  /**
   * Get user profile from Firestore by UID
   */
  async getUserProfile(uid) {
    if (isFirebaseConfigured && db) {
      try {
        const userDocRef = doc(db, "users", uid);
        const snapshot = await getDoc(userDocRef);
        if (snapshot.exists()) {
          return snapshot.data();
        }
      } catch (err) {
        console.warn("Error fetching Firestore user profile:", err);
      }
    }

    // Fallback from local users
    const localUsers = getLocalDevUsers();
    return localUsers.find(u => u.uid === uid) || null;
  },

  /**
   * Update authenticated user's own profile (Name, Phone, Department)
   */
  async updateUserProfile(uid, { fullName, phone, department }) {
    if (!uid) throw new Error("User identifier is required.");

    const cleanName = fullName ? fullName.trim() : "";
    const cleanPhone = phone ? phone.trim() : "";
    const cleanDept = department ? department.trim() : "";

    if (isFirebaseConfigured && db) {
      try {
        const userDocRef = doc(db, "users", uid);
        await updateDoc(userDocRef, {
          fullName: cleanName,
          name: cleanName,
          phone: cleanPhone,
          department: cleanDept,
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        console.warn("Firestore profile update notice:", err);
      }
    }

    // Update local dev user storage if applicable
    const localUsers = getLocalDevUsers();
    const updated = localUsers.map(u => u.uid === uid ? {
      ...u,
      fullName: cleanName,
      name: cleanName,
      phone: cleanPhone,
      department: cleanDept
    } : u);
    safeStorage.setItem("voltflow_auth_users", JSON.stringify(updated));

    // Update active session storage
    const currentSession = safeStorage.getItem("voltflow_current_auth_session");
    if (currentSession) {
      try {
        const parsed = JSON.parse(currentSession);
        if (parsed.profile) {
          parsed.profile.fullName = cleanName;
          parsed.profile.name = cleanName;
          parsed.profile.phone = cleanPhone;
          parsed.profile.department = cleanDept;
          safeStorage.setItem("voltflow_current_auth_session", JSON.stringify(parsed));
        }
      } catch {}
    }

    return { fullName: cleanName, name: cleanName, phone: cleanPhone, department: cleanDept };
  },

  /**
   * Create an engineer account.
   * STRICT SECURITY RULE: Only Main Admin can create an engineer account!
   */
  async createEngineerAccount(creatorProfile, newUserData) {
    // 1. Verify creator is Main Admin
    if (!creatorProfile || creatorProfile.role !== "Main Admin") {
      throw new Error("Unauthorized: Only an authorized Main Admin can create user accounts.");
    }

    // 2. Verify mandatory fields
    if (!newUserData.fullName || !newUserData.email || !newUserData.branchId) {
      throw new Error("Full name, email, and assigned branch are strictly required.");
    }

    // 3. Prevent privilege escalation
    if (newUserData.role === "Main Admin" && creatorProfile.role !== "Main Admin") {
      throw new Error("Security violation: Only Main Admin can manage administrative roles.");
    }

    const assignedRole = "Branch Engineer";
    const cleanEmail = newUserData.email.trim().toLowerCase();
    const tempPassword = newUserData.password?.trim() || "VoltFlow@2026";

    if (tempPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    // Firestore record payload
    const userPayload = {
      fullName: newUserData.fullName.trim(),
      name: newUserData.fullName.trim(),
      email: cleanEmail,
      phone: newUserData.phone?.trim() || "+880 1700-000000",
      role: assignedRole,
      branchId: newUserData.branchId,
      branchName: newUserData.branchName || "Assigned Substation",
      department: newUserData.department || "Substation Protection & Operations",
      isActive: true,
      createdAt: serverTimestamp ? serverTimestamp() : new Date().toISOString()
    };

    let createdUid = null;

    // Provision user in Firebase Authentication using an isolated secondary client app
    if (isFirebaseConfigured) {
      const config = getFirebaseConfig();
      if (config) {
        const secAppName = `SecApp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        let secondaryApp = null;
        try {
          secondaryApp = initializeApp(config, secAppName);
          const secondaryAuth = getAuth(secondaryApp);
          const cred = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, tempPassword);
          createdUid = cred.user.uid;
        } catch (authErr) {
          if (authErr.code === "auth/email-already-in-use") {
            // Email is already registered in Firebase Auth.
            // Check if existing doc exists in Firestore
            try {
              const q = query(collection(db, "users"), where("email", "==", cleanEmail));
              const snap = await getDocs(q);
              if (!snap.empty) {
                createdUid = snap.docs[0].id;
              }
            } catch {}
          } else if (authErr.code === "auth/weak-password") {
            throw new Error("Password is too weak. Please use at least 6 characters.");
          } else if (authErr.code === "auth/invalid-email") {
            throw new Error("Invalid corporate email format.");
          } else {
            console.warn("Secondary Auth notice:", authErr.message);
          }
        } finally {
          if (secondaryApp) {
            try {
              await deleteApp(secondaryApp);
            } catch {}
          }
        }
      }
    }

    if (!createdUid) {
      createdUid = `usr_${Date.now()}`;
    }

    userPayload.uid = createdUid;

    // Save directly to Firestore
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "users", createdUid), userPayload, { merge: true });
      } catch (err) {
        console.error("Firestore user creation error:", err);
        throw new Error(`Failed to save user in Cloud Firestore: ${err.message}`);
      }
    }

    // Local development storage update
    const localUsers = getLocalDevUsers();
    const filtered = localUsers.filter(u => u.email.toLowerCase() !== cleanEmail);
    const createdUser = {
      uid: createdUid,
      ...userPayload,
      role: "Branch Engineer",
      password: tempPassword
    };

    filtered.push(createdUser);
    safeStorage.setItem("voltflow_auth_users", JSON.stringify(filtered));
    return createdUser;
  },

  /**
   * Toggle user active/disabled status
   */
  async setUserActiveStatus(adminProfile, targetUid, isActive) {
    if (!adminProfile || adminProfile.role !== "Main Admin") {
      throw new Error("Unauthorized: Only Main Admin can enable or disable user accounts.");
    }

    if (isFirebaseConfigured && db) {
      const userRef = doc(db, "users", targetUid);
      await updateDoc(userRef, { isActive, updatedAt: serverTimestamp() });
    }

    const localUsers = getLocalDevUsers();
    const updated = localUsers.map(u => u.uid === targetUid ? { ...u, isActive } : u);
    safeStorage.setItem("voltflow_auth_users", JSON.stringify(updated));
  },

  /**
   * Update any user's role and assigned substation anytime
   */
  async updateUserRoleAndBranch(adminProfile, targetUid, newRole, newBranchId, newBranchName) {
    if (!adminProfile || adminProfile.role !== "Main Admin") {
      throw new Error("Unauthorized: Only Main Admin can update roles and station assignments.");
    }

    if (isFirebaseConfigured && db) {
      const userRef = doc(db, "users", targetUid);
      await updateDoc(userRef, {
        role: newRole,
        branchId: newBranchId,
        branchName: newBranchName,
        updatedAt: serverTimestamp()
      });
    }

    const localUsers = getLocalDevUsers();
    const updated = localUsers.map(u => 
      u.uid === targetUid 
        ? { ...u, role: newRole, branchId: newBranchId, branchName: newBranchName }
        : u
    );
    safeStorage.setItem("voltflow_auth_users", JSON.stringify(updated));
    return { success: true };
  },

  /**
   * Delete or remove user account
   */
  async deleteUserAccount(adminProfile, targetUid) {
    if (!adminProfile || adminProfile.role !== "Main Admin") {
      throw new Error("Unauthorized: Only Main Admin can delete user accounts.");
    }

    if (isFirebaseConfigured && db) {
      const userRef = doc(db, "users", targetUid);
      await updateDoc(userRef, { isActive: false, isDeleted: true, updatedAt: serverTimestamp() });
    }

    const localUsers = getLocalDevUsers();
    const updated = localUsers.filter(u => u.uid !== targetUid);
    safeStorage.setItem("voltflow_auth_users", JSON.stringify(updated));
  },

  /**
   * Secure initial admin bootstrap process
   * Strictly allows creating the very first initial admin if none exists.
   */
  async bootstrapFirstAdmin({ email, password, fullName = "Engr. Rafiqul Islam", phone = "+880 1711-234567" }) {
    if (!email || !password) throw new Error("Email and password are required.");
    const cleanEmail = email.trim().toLowerCase();

    if (isFirebaseConfigured && auth && db) {
      // 1. Check if an admin already exists in Firestore
      try {
        const usersCol = collection(db, "users");
        const snapshot = await getDocs(usersCol);
        const hasAdmin = snapshot.docs.some(doc => doc.data().role === "Main Admin");

        if (hasAdmin) {
          throw new Error("System violation: Initial Main Admin already provisioned. Public creation is disabled.");
        }
      } catch (err) {
        if (err.message.includes("System violation")) throw err;
      }

      // 2. Create the first admin in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: fullName });

      const adminProfile = {
        uid: user.uid,
        fullName,
        email: cleanEmail,
        phone,
        role: "Main Admin",
        branchId: "loc_gazaria_230",
        branchName: "Gazaria 230 KV Substation",
        department: "Grid Operations & Executive Central",
        isActive: true,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, "users", user.uid), adminProfile);
      return { user, profile: adminProfile };
    }

    // Local dev mode fallback
    const localUsers = getLocalDevUsers();
    const existing = localUsers.find(u => u.email === cleanEmail);
    if (existing) {
      existing.password = password;
      return { user: existing, profile: existing };
    }

    const newAdmin = {
      uid: `usr_${Date.now()}`,
      email: cleanEmail,
      password,
      fullName,
      phone,
      role: "Main Admin",
      branchId: "loc_gazaria_230",
      branchName: "Gazaria 230 KV Substation",
      department: "Grid Operations & Executive Central",
      isActive: true,
      createdAt: new Date().toISOString()
    };
    localUsers.unshift(newAdmin);
    localStorage.setItem("voltflow_auth_users", JSON.stringify(localUsers));
    return { user: newAdmin, profile: newAdmin };
  }
};
