import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db, isFirebaseConfigured } from "../services/firebase";
import { authService } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let unsubscribe = () => {};

    // 1. If Firebase Auth is configured and active
    if (isFirebaseConfigured && auth) {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setIsLoading(true);
        if (firebaseUser) {
          try {
            const profile = await authService.getUserProfile(firebaseUser.uid);
            if (profile && profile.isActive === false) {
              await authService.logout();
              setCurrentUser(null);
              setUserProfile(null);
              setAuthError("Your account has been deactivated. Please contact your Main Administrator.");
            } else {
              setCurrentUser(firebaseUser);
              setUserProfile(profile || {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                fullName: firebaseUser.displayName || "Authenticated Staff",
                role: "Branch Engineer",
                branchId: "loc_gazaria_230",
                isActive: true
              });
              setAuthError(null);
            }
          } catch (err) {
            console.error("Failed to load user profile:", err);
            setCurrentUser(null);
            setUserProfile(null);
          }
        } else {
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
        isFirebaseConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
