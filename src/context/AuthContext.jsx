import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db, isFirebaseConfigured } from "../services/firebase";
import { authService } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("voltflow_current_auth_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.user) return parsed.user;
        if (parsed.uid && parsed.email) {
          return {
            uid: parsed.uid,
            email: parsed.email,
            displayName: parsed.profile?.fullName || parsed.profile?.name || "Authenticated Staff"
          };
        }
      }
    } catch {}
    return null;
  });

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("voltflow_current_auth_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.profile || null;
      }
    } catch {}
    return null;
  });

  const [isLoading, setIsLoading] = useState(() => {
    const saved = typeof localStorage !== "undefined" ? localStorage.getItem("voltflow_current_auth_session") : null;
    return !saved;
  });
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let unsubscribe = () => {};

    // 1. If Firebase Auth is configured and active
    if (isFirebaseConfigured && auth) {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const profile = await authService.getUserProfile(firebaseUser.uid);
            if (profile && profile.isActive === false) {
              await authService.logout();
              setCurrentUser(null);
              setUserProfile(null);
              setAuthError("Your account has been deactivated. Please contact your Main Administrator.");
            } else {
              const verifiedUser = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: profile?.fullName || profile?.name || firebaseUser.displayName || "Authenticated Staff"
              };
              setCurrentUser(verifiedUser);
              const cleanProfile = profile || {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                fullName: verifiedUser.displayName,
                name: verifiedUser.displayName,
                role: "Branch Engineer",
                branchId: "loc_kaliakoir_230",
                isActive: true
              };
              setUserProfile(cleanProfile);
              localStorage.setItem("voltflow_role", cleanProfile.role);
              localStorage.setItem("voltflow_current_auth_session", JSON.stringify({
                uid: cleanProfile.uid,
                email: cleanProfile.email,
                user: verifiedUser,
                profile: cleanProfile
              }));
              setAuthError(null);
            }
          } catch (err) {
            console.error("Failed to load user profile:", err);
          }
        } else {
          // If Firebase Auth returns null (e.g. initial sync delay or offline), check active local storage session
          const savedSession = localStorage.getItem("voltflow_current_auth_session");
          if (savedSession) {
            try {
              const parsed = JSON.parse(savedSession);
              if (parsed.profile && parsed.profile.isActive !== false) {
                // Keep session active! Do NOT log user out on page reload!
                const fallbackUser = parsed.user || {
                  uid: parsed.uid,
                  email: parsed.email,
                  displayName: parsed.profile?.fullName || parsed.profile?.name || "Authenticated Staff"
                };
                setCurrentUser(fallbackUser);
                setUserProfile(parsed.profile);
                setIsLoading(false);
                return;
              }
            } catch {}
          }
          setCurrentUser(null);
          setUserProfile(null);
        }
        setIsLoading(false);
      });
    } else {
      // 2. Check persistent local development session
      const savedSession = localStorage.getItem("voltflow_current_auth_session");
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          if (parsed.profile?.isActive === false) {
            localStorage.removeItem("voltflow_current_auth_session");
            setCurrentUser(null);
            setUserProfile(null);
          } else {
            setCurrentUser(parsed.user);
            setUserProfile(parsed.profile);
          }
        } catch {
          localStorage.removeItem("voltflow_current_auth_session");
        }
      } else {
        // Auto-seed default initial admin for instant test login convenience
        const defaults = [
          {
            uid: "usr_admin_001",
            email: "admin@ccce.com.bd",
            fullName: "Engr. Rafiqul Islam",
            role: "Main Admin",
            branchId: "loc_ccce_main",
            branchName: "CCCE Central Main Branch",
            department: "CCCE Central HQ & Executive Directorate",
            isActive: true
          }
        ];
        // Don't auto-log in, leave on login screen so user can test login flow
      }
      setIsLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await authService.login(email, password);
      setCurrentUser(result.user);
      setUserProfile(result.profile);
      setIsLoading(false);
      return result;
    } catch (err) {
      setIsLoading(false);
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setCurrentUser(null);
      setUserProfile(null);
      setAuthError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (fields) => {
    const uid = userProfile?.uid || currentUser?.uid;
    if (!uid) throw new Error("No active session.");
    const updated = await authService.updateUserProfile(uid, fields);
    setUserProfile((prev) => ({
      ...prev,
      ...updated
    }));
    return updated;
  };

  const changePassword = async (currentPassword, newPassword) => {
    return await authService.changeCurrentUserPassword(currentPassword, newPassword);
  };

  const adminResetPassword = async (targetUid, targetEmail, newPassword) => {
    return await authService.adminResetUserPassword(userProfile, targetUid, targetEmail, newPassword);
  };

  // Role helpers
  const userRole = userProfile?.role || "Branch Engineer";
  const isAdmin = userRole === "Main Admin";
  const isEngineer = userRole === "Branch Engineer";
  const assignedBranchId = userProfile?.branchId || null;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        userRole,
        assignedBranchId,
        isAdmin,
        isEngineer,
        isLoading,
        authError,
        setAuthError,
        login,
        logout,
        updateUserProfile,
        changePassword,
        adminResetPassword,
        isFirebaseConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
