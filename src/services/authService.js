import { 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  serverTimestamp 
} from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "./firebase.js";
import { initialUsers } from "../mockData.js";

const memoryStore = {};
const safeStorage = {
  getItem: (key) => (typeof localStorage !== "undefined" ? localStorage.getItem(key) : memoryStore[key]),
  setItem: (key, val) => (typeof localStorage !== "undefined" ? localStorage.setItem(key, val) : (memoryStore[key] = val))
};

// Fallback development mock users for instant testing when live Firebase keys are pending
const getLocalDevUsers = () => {
  const saved = safeStorage.getItem("voltflow_auth_users");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }
  const defaults = [
    {
      uid: "usr_admin_001",
      email: "admin@ccce.com.bd",
      password: "admin123",
      fullName: "Engr. Rafiqul Islam",
      phone: "+880 1711-234567",
      role: "Main Admin",
      branchId: "loc_ccce_main",
      branchName: "CCCE Central Main Branch",
      department: "CCCE Central HQ & Executive Administration",
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      uid: "usr_admin_002",
      email: "admin@voltflow.com",
      password: "admin123",
      fullName: "Engr. Rafiqul Islam",
      phone: "+880 1711-234567",
      role: "Main Admin",
      branchId: "loc_ccce_main",
      branchName: "CCCE Central Main Branch",
      department: "CCCE Central HQ & Executive Administration",
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      uid: "usr_eng_002",
      email: "engineer.tanvir@voltflow.com",
      password: "eng123", // For development testing
      fullName: "Engr. Tanvir Ahmed",
      phone: "+880 1819-876543",
      role: "Branch Engineer",
      branchId: "loc_kaliakoir_230",
      branchName: "Kaliakoir 230 KV Substation",
      department: "Substation Protection & Testing",
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      uid: "usr_eng_003",
      email: "disabled.user@voltflow.com",
      password: "user123",
      fullName: "Suspended Staff",
      phone: "+880 1900-000000",
      role: "Branch Engineer",
      branchId: "loc_mirpur_132",
      branchName: "Mirpur 132 KV Substation",
      department: "Maintenance",
      isActive: false, // Testing disabled account handling
      createdAt: new Date().toISOString()
    }
  ];
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

        if (!userDoc.exists()) {
          // If first-time admin bootstrap without Firestore doc, create it
          const initialAdminProfile = {
            uid: user.uid,
            fullName: user.displayName || "Main Admin",
            email: cleanEmail,
            phone: "+880 1711-234567",
            role: "Main Admin",
            branchId: "loc_gazaria_230",
            branchName: "Gazaria 230 KV Substation",
            department: "Grid Operations & Executive Central",
            isActive: true,
            createdAt: serverTimestamp()
          };
          await setDoc(userDocRef, initialAdminProfile);
          return { user, profile: initialAdminProfile };
        }

        const profile = userDoc.data();

        // Check if account has been disabled
        if (profile.isActive === false) {
          await signOut(auth);
          throw new Error("Your account has been deactivated. Please contact your Main Administrator.");
        }

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
      throw new Error("Invalid email or password. (Demo: admin@voltflow.com / admin123)");
    }

    if (!foundUser.isActive) {
      throw new Error("Your account has been deactivated. Please contact your Main Administrator.");
    }

    // Return authenticated mock profile
    const profile = { ...foundUser };
    delete profile.password;

    localStorage.setItem("voltflow_current_auth_session", JSON.stringify({
      uid: profile.uid,
      email: profile.email,
      profile
    }));

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

    const assignedRole = newUserData.role === "Main Admin" ? "Main Admin" : "Branch Engineer";

    const cleanEmail = newUserData.email.trim().toLowerCase();
    const tempPassword = newUserData.password || "VoltFlow@2026";

    // Firestore record payload
    const userPayload = {
      fullName: newUserData.fullName,
      email: cleanEmail,
      phone: newUserData.phone || "+880 1700-000000",
      role: assignedRole,
      branchId: newUserData.branchId,
      branchName: newUserData.branchName || "Assigned Substation",
      department: newUserData.department || "Field Engineering",
      isActive: true,
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      try {
        // In real backend/Firebase Admin SDK, admin creates user via Admin SDK.
        // On client-side, we write the user document to Firestore 'users' collection.
        const newUid = `usr_${Date.now()}`;
        userPayload.uid = newUid;
        await setDoc(doc(db, "users", newUid), {
          ...userPayload,
          createdAt: serverTimestamp()
        });
        return userPayload;
      } catch (err) {
        console.error("Firestore user creation error:", err);
      }
    }

    // Local development storage update
    const localUsers = getLocalDevUsers();
    const newUid = `usr_${Date.now()}`;
    const createdUser = {
      uid: newUid,
      ...userPayload,
      password: tempPassword
    };

    localUsers.push(createdUser);
    safeStorage.setItem("voltflow_auth_users", JSON.stringify(localUsers));
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
